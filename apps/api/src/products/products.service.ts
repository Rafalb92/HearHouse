import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';

import { Product, ProductStatus } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { UploadService } from '@/upload/upload.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  CreateVariantDto,
  UpdateVariantDto,
  AddImageDto,
  ReorderImagesDto,
} from './dto/products.dto';

const DEFAULT_PAGE_LIMIT = 12;
const MAX_PAGE_LIMIT = 48;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepo: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imagesRepo: Repository<ProductImage>,
    private readonly upload: UploadService,
  ) {}

  // ─── Public queries ───────────────────────────────────────────────────────────

  async findAll(query: ProductQueryDto) {
    const {
      category,
      brand,
      search,
      tags,
      featured,
      minPriceCents,
      maxPriceCents,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = DEFAULT_PAGE_LIMIT,
    } = query;

    const take = Math.min(limit, MAX_PAGE_LIMIT);
    const skip = (page - 1) * take;

    const qb = this.productsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('p.images', 'i', 'i.sortOrder = 0') // tylko główne zdjęcie
      .where('p.status = :status', { status: ProductStatus.ACTIVE });

    if (category) qb.andWhere('p.category = :category', { category });
    if (brand) qb.andWhere('p.brand ILIKE :brand', { brand: `%${brand}%` });
    if (featured !== undefined)
      qb.andWhere('p.featured = :featured', { featured });
    if (search) {
      qb.andWhere(
        '(p.name ILIKE :search OR p.brand ILIKE :search OR p.model ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (tags?.length) {
      qb.andWhere('p.tags && :tags', { tags }); // array overlap operator
    }
    if (minPriceCents !== undefined) {
      qb.andWhere('p.basePriceCents >= :minPriceCents', { minPriceCents });
    }
    if (maxPriceCents !== undefined) {
      qb.andWhere('p.basePriceCents <= :maxPriceCents', { maxPriceCents });
    }

    // Sortowanie
    const sortColumn =
      sortBy === 'price'
        ? 'p.basePriceCents'
        : sortBy === 'avgRating'
          ? 'p.avgRating'
          : `p.${sortBy}`;
    qb.orderBy(sortColumn, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    qb.take(take).skip(skip);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
        hasNextPage: page * take < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productsRepo.findOne({
      where: { slug, status: ProductStatus.ACTIVE },
      relations: ['variants', 'images'],
      order: { images: { sortOrder: 'ASC' } },
    });

    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  async findFeatured(limit = 8) {
    return this.productsRepo.find({
      where: { featured: true, status: ProductStatus.ACTIVE },
      relations: ['variants', 'images'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // ─── Admin queries ────────────────────────────────────────────────────────────

  async findAllAdmin(query: ProductQueryDto) {
    const { page = 1, limit = DEFAULT_PAGE_LIMIT } = query;
    const take = Math.min(limit, MAX_PAGE_LIMIT);
    const skip = (page - 1) * take;

    const [items, total] = await this.productsRepo.findAndCount({
      relations: ['variants', 'images'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      items,
      meta: { total, page, limit: take, totalPages: Math.ceil(total / take) },
    };
  }

  async findById(id: string) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['variants', 'images'],
      order: { images: { sortOrder: 'ASC' } },
    });
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  // ─── Admin mutations ──────────────────────────────────────────────────────────

  async create(dto: CreateProductDto) {
    const slug = await this.resolveSlug(
      dto.slug ?? `${dto.brand} ${dto.model}`,
    );

    const product = await this.productsRepo.save(
      this.productsRepo.create({
        slug,
        brand: dto.brand,
        model: dto.model,
        name: dto.name ?? `${dto.brand} ${dto.model}`,
        category: dto.category,
        status: dto.status ?? ProductStatus.DRAFT,
        shortDescription: dto.shortDescription ?? null,
        description: dto.description ?? null,
        currency: dto.currency ?? 'PLN',
        basePriceCents: dto.basePriceCents,
        specs: dto.specs ?? null,
        tags: dto.tags ?? [],
        featured: dto.featured ?? false,
        seoTitle: dto.seoTitle ?? null,
        seoDescription: dto.seoDescription ?? null,
      }),
    );

    // Utwórz warianty
    const variants = await this.variantsRepo.save(
      dto.variants.map((v) =>
        this.variantsRepo.create({ ...v, productId: product.id }),
      ),
    );

    return { ...product, variants, images: [] };
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findById(id);

    if (dto.slug && dto.slug !== product.slug) {
      product.slug = await this.resolveSlug(dto.slug, id);
    }

    Object.assign(product, {
      brand: dto.brand ?? product.brand,
      model: dto.model ?? product.model,
      name: dto.name ?? product.name,
      category: dto.category ?? product.category,
      status: dto.status ?? product.status,
      shortDescription: dto.shortDescription ?? product.shortDescription,
      description: dto.description ?? product.description,
      currency: dto.currency ?? product.currency,
      basePriceCents: dto.basePriceCents ?? product.basePriceCents,
      specs: dto.specs ?? product.specs,
      tags: dto.tags ?? product.tags,
      featured: dto.featured ?? product.featured,
      seoTitle: dto.seoTitle ?? product.seoTitle,
      seoDescription: dto.seoDescription ?? product.seoDescription,
    });

    return this.productsRepo.save(product);
  }

  async remove(id: string) {
    const product = await this.findById(id);

    // Usuń zdjęcia z Cloudinary
    for (const image of product.images) {
      await this.upload.deleteFile(image.publicId);
    }

    await this.productsRepo.remove(product);
    return { ok: true };
  }

  // ─── Variants ─────────────────────────────────────────────────────────────────

  async addVariant(productId: string, dto: CreateVariantDto) {
    await this.findById(productId); // sprawdź że produkt istnieje

    const existing = await this.variantsRepo.findOne({
      where: { sku: dto.sku },
    });
    if (existing) throw new BadRequestException('SKU already exists.');

    return this.variantsRepo.save(
      this.variantsRepo.create({ ...dto, productId }),
    );
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ) {
    const variant = await this.getVariant(productId, variantId);
    Object.assign(variant, dto);
    return this.variantsRepo.save(variant);
  }

  async removeVariant(productId: string, variantId: string) {
    const product = await this.findById(productId);
    if (product.variants.length <= 1) {
      throw new BadRequestException('Product must have at least one variant.');
    }
    const variant = await this.getVariant(productId, variantId);
    await this.variantsRepo.remove(variant);
    return { ok: true };
  }

  // ─── Images ───────────────────────────────────────────────────────────────────

  async addImage(productId: string, dto: AddImageDto) {
    await this.findById(productId);

    const count = await this.imagesRepo.count({ where: { productId } });

    return this.imagesRepo.save(
      this.imagesRepo.create({
        productId,
        url: dto.url,
        publicId: dto.publicId,
        alt: dto.alt ?? null,
        variantId: dto.variantId ?? null,
        sortOrder: dto.sortOrder ?? count,
        width: dto.width ?? null,
        height: dto.height ?? null,
      }),
    );
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.imagesRepo.findOne({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found.');
    if (image.productId !== productId) throw new ForbiddenException();

    await this.upload.deleteFile(image.publicId);
    await this.imagesRepo.remove(image);
    return { ok: true };
  }

  async reorderImages(productId: string, dto: ReorderImagesDto) {
    await this.findById(productId);

    const updates = dto.imageIds.map((id, index) =>
      this.imagesRepo.update({ id, productId }, { sortOrder: index }),
    );

    await Promise.all(updates);
    return this.imagesRepo.find({
      where: { productId },
      order: { sortOrder: 'ASC' },
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async resolveSlug(raw: string, excludeId?: string): Promise<string> {
    const base = slugify(raw, { lower: true, strict: true });

    const qb = this.productsRepo
      .createQueryBuilder('p')
      .where('p.slug LIKE :pattern', { pattern: `${base}%` });

    if (excludeId) qb.andWhere('p.id != :excludeId', { excludeId });

    const existing = await qb.getMany();

    if (existing.length === 0) return base;

    // Znajdź wolny suffix: base-2, base-3 itd.
    const existingSlugs = new Set(existing.map((p) => p.slug));
    let suffix = 2;
    while (existingSlugs.has(`${base}-${suffix}`)) suffix++;
    return `${base}-${suffix}`;
  }

  private async getVariant(productId: string, variantId: string) {
    const variant = await this.variantsRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found.');
    if (variant.productId !== productId) throw new ForbiddenException();
    return variant;
  }
}
