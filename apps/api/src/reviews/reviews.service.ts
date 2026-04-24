import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@/products/entities/product.entity';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  // ─── Public ───────────────────────────────────────────────────────────────────

  async getProductReviews(productId: string): Promise<Review[]> {
    return this.reviewsRepo.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserReviewForProduct(
    userId: string,
    productId: string,
  ): Promise<Review | null> {
    return this.reviewsRepo.findOne({ where: { userId, productId } });
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  async create(
    userId: string,
    productId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const product = await this.productsRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found.');

    const existing = await this.reviewsRepo.findOne({
      where: { userId, productId },
    });
    if (existing)
      throw new BadRequestException('You have already reviewed this product.');

    const review = await this.reviewsRepo.save(
      this.reviewsRepo.create({
        userId,
        productId,
        rating: dto.rating,
        comment: dto.comment ?? null,
      }),
    );

    await this.updateProductRating(productId);

    // Zwróć z relacją user
    return this.reviewsRepo.findOne({
      where: { id: review.id },
      relations: ['user'],
    }) as Promise<Review>;
  }

  async update(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewsRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found.');
    if (review.userId !== userId) throw new ForbiddenException();

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment ?? null;

    await this.reviewsRepo.save(review);
    await this.updateProductRating(review.productId);

    return this.reviewsRepo.findOne({
      where: { id: reviewId },
      relations: ['user'],
    }) as Promise<Review>;
  }

  async remove(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewsRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found.');
    if (review.userId !== userId) throw new ForbiddenException();

    const productId = review.productId;
    await this.reviewsRepo.remove(review);
    await this.updateProductRating(productId);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async updateProductRating(productId: string): Promise<void> {
    const result = await this.reviewsRepo
      .createQueryBuilder('r')
      .select('COUNT(r.id)', 'count')
      .addSelect('AVG(r.rating)', 'avg')
      .where('r.productId = :productId', { productId })
      .getRawOne<{ count: string; avg: string | null }>();

    const count = parseInt(result?.count ?? '0', 10);
    const avg = result?.avg ? parseFloat(parseFloat(result.avg).toFixed(2)) : 0;

    await this.productsRepo.update(productId, {
      reviewCount: count,
      avgRating: avg,
    });
  }
}
