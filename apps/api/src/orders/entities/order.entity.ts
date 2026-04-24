import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum ShippingMethod {
  PICKUP = 'PICKUP',
  COURIER = 'COURIER',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 200 })
  addressLine1: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  addressLine2: string | null;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 20 })
  postalCode: string;

  @Column({ type: 'varchar', length: 2 })
  country: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // ─── Shipping ───────────────────────────────────────────────────────────────

  @Column({
    type: 'enum',
    enum: ShippingMethod,
    default: ShippingMethod.COURIER,
  })
  shippingMethod: ShippingMethod;

  @Column({ type: 'int', default: 0 })
  shippingCents: number;

  // ─── Payment ────────────────────────────────────────────────────────────────

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId: string | null;

  // ─── Totals ─────────────────────────────────────────────────────────────────

  @Column({ type: 'int' })
  subtotalCents: number; // suma produktów bez dostawy

  @Column({ type: 'int' })
  totalCents: number; // subtotal + shipping

  @Column({ type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: false,
  })
  items: OrderItem[];
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid' })
  variantId: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'varchar', length: 100 })
  variantSku: string;

  @Column({ type: 'varchar', length: 100 })
  variantColorName: string;

  @Column({ type: 'varchar', length: 7 })
  variantColorHex: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'int' })
  priceCents: number;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
