import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // Opcjonalne powiązanie z wariantem (null = dotyczy wszystkich wariantów)
  @Column({ type: 'uuid', nullable: true, default: null })
  variantId: string | null;

  @Column({ type: 'varchar', length: 1000 })
  url: string; // Cloudinary secure_url

  @Column({ type: 'varchar', length: 500 })
  publicId: string; // Cloudinary public_id — potrzebny do usuwania

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  alt: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number; // 0 = główne zdjęcie

  @Column({ type: 'int', nullable: true, default: null })
  width: number | null;

  @Column({ type: 'int', nullable: true, default: null })
  height: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
