import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum VariantFinish {
  MATTE = 'matte',
  GLOSSY = 'glossy',
  SATIN = 'satin',
  METALLIC = 'metallic',
}

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 100 })
  colorName: string;

  @Column({ type: 'char', length: 7 })
  colorHex: string; // #RRGGBB

  @Column({
    type: 'enum',
    enum: VariantFinish,
    nullable: true,
    default: null,
  })
  finish: VariantFinish | null;

  // Materiały jako JSONB — { shell: "plastic", earcups: "leather" }
  @Column({ type: 'jsonb', nullable: true, default: null })
  materials: Record<string, string> | null;

  // Różnica ceny względem basePriceCents — może być 0 lub ujemna
  @Column({ type: 'int', default: 0 })
  priceDeltaCents: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
