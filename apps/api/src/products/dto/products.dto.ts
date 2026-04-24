import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO4217CurrencyCode,
  IsObject,
  IsOptional,
  IsString,
  IsHexColor,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory, ProductStatus } from '../entities/product.entity';
import { VariantFinish } from '../entities/product-variant.entity';

// ─── Variant DTO ─────────────────────────────────────────────────────────────

export class CreateVariantDto {
  @IsString()
  @MaxLength(100)
  sku: string;

  @IsString()
  @MaxLength(100)
  colorName: string;

  @IsHexColor()
  colorHex: string;

  @IsOptional()
  @IsEnum(VariantFinish)
  finish?: VariantFinish;

  @IsOptional()
  @IsObject()
  materials?: Record<string, string>;

  @IsOptional()
  @IsInt()
  priceDeltaCents?: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  colorName?: string;

  @IsOptional()
  @IsHexColor()
  colorHex?: string;

  @IsOptional()
  @IsEnum(VariantFinish)
  finish?: VariantFinish;

  @IsOptional()
  @IsObject()
  materials?: Record<string, string>;

  @IsOptional()
  @IsInt()
  priceDeltaCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

// ─── Image DTO ───────────────────────────────────────────────────────────────

export class AddImageDto {
  @IsUrl()
  url: string;

  @IsString()
  publicId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;
}

export class ReorderImagesDto {
  @IsArray()
  @IsString({ each: true })
  imageIds: string[]; // w żądanej kolejności
}

// ─── Product DTO ─────────────────────────────────────────────────────────────

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string; // jeśli puste — generujemy z brand+model

  @IsString()
  @MaxLength(100)
  brand: string;

  @IsString()
  @MaxLength(100)
  model: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string; // jeśli puste — `${brand} ${model}`

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsISO4217CurrencyCode()
  currency?: string;

  @IsInt()
  @Min(0)
  basePriceCents: number;

  @IsOptional()
  @IsObject()
  specs?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsISO4217CurrencyCode()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  basePriceCents?: number;

  @IsOptional()
  @IsObject()
  specs?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;
}

// ─── Query DTO ───────────────────────────────────────────────────────────────

export class ProductQueryDto {
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minPriceCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxPriceCents?: number;

  @IsOptional()
  @IsEnum(['name', 'price', 'createdAt', 'avgRating'])
  sortBy?: 'name' | 'price' | 'createdAt' | 'avgRating';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
