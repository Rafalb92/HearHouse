import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum ProductCategory {
  IN_EAR = 'IN_EAR',
  ON_EAR = 'ON_EAR',
  OVER_EAR = 'OVER_EAR',
  OPEN_BACK = 'OPEN_BACK',
  TRUE_WIRELESS = 'TRUE_WIRELESS',
  GAMING = 'GAMING',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true, default: null })
  description: string | null;

  @Column({ type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  // Cena bazowa w groszach — warianty mogą mieć delta
  @Column({ type: 'int' })
  basePriceCents: number;

  // Specs jako JSONB — elastyczne, queryowalne
  @Column({ type: 'jsonb', nullable: true, default: null })
  specs: Record<string, unknown> | null;

  // Tagi jako tablica tekstów
  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  // Denormalizowane dla szybkiego odczytu
  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  // SEO overrides
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  seoTitle: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  seoDescription: string | null;

  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (i) => i.product, { cascade: true })
  images: ProductImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
