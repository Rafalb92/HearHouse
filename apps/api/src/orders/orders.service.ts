import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ShippingMethod,
} from './entities/order.entity';
import { Product } from '@/products/entities/product.entity';
import { ProductVariant } from '@/products/entities/product-variant.entity';
import { CreateOrderDto } from './dto/orders.dto';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { orderConfirmationTemplate } from '@/mail/templates/order-confirmation.template';

// ─── Shipping config ──────────────────────────────────────────────────────────

const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  [ShippingMethod.PICKUP]: 0,
  [ShippingMethod.COURIER]: 1500, // 15.00 PLN
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemsRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepo: Repository<ProductVariant>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────────

  async create(dto: CreateOrderDto, userId?: string): Promise<Order> {
    const resolvedItems: {
      product: Product;
      variant: ProductVariant;
      quantity: number;
      priceCents: number;
    }[] = [];

    for (const item of dto.items) {
      const product = await this.productsRepo.findOne({
        where: { id: item.productId },
        relations: ['images'],
      });
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found.`);
      }

      const variant = await this.variantsRepo.findOne({
        where: { id: item.variantId, productId: item.productId },
      });
      if (!variant) {
        throw new BadRequestException(`Variant ${item.variantId} not found.`);
      }
      if (!variant.isAvailable || variant.stock < item.quantity) {
        throw new BadRequestException(
          `${product.name} (${variant.colorName}) is out of stock.`,
        );
      }

      resolvedItems.push({
        product,
        variant,
        quantity: item.quantity,
        priceCents: product.basePriceCents + variant.priceDeltaCents,
      });
    }

    const currency = resolvedItems[0]?.product.currency ?? 'PLN';
    const subtotalCents = resolvedItems.reduce(
      (sum, i) => sum + i.priceCents * i.quantity,
      0,
    );
    const shippingCents = SHIPPING_COSTS[dto.shippingMethod];
    const totalCents = subtotalCents + shippingCents;

    const order = await this.ordersRepo.save(
      this.ordersRepo.create({
        userId: userId ?? null,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2 ?? null,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country,
        shippingMethod: dto.shippingMethod,
        shippingCents,
        notes: dto.notes ?? null,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        paymentIntentId: null,
        subtotalCents,
        totalCents,
        currency,
      }),
    );

    const orderItems = await this.itemsRepo.save(
      resolvedItems.map((i) =>
        this.itemsRepo.create({
          orderId: order.id,
          productId: i.product.id,
          variantId: i.variant.id,
          productName: i.product.name,
          variantSku: i.variant.sku,
          variantColorName: i.variant.colorName,
          variantColorHex: i.variant.colorHex,
          imageUrl: i.product.images?.[0]?.url ?? null,
          priceCents: i.priceCents,
          quantity: i.quantity,
        }),
      ),
    );

    // Zmniejsz stock
    for (const i of resolvedItems) {
      await this.variantsRepo.update(i.variant.id, {
        stock: i.variant.stock - i.quantity,
        isAvailable: i.variant.stock - i.quantity > 0,
      });
    }

    return { ...order, items: orderItems };
  }

  // ─── Payment ──────────────────────────────────────────────────────────────────

  async markAsPaid(orderId: string, paymentIntentId: string): Promise<void> {
    await this.ordersRepo.update(orderId, {
      paymentStatus: PaymentStatus.PAID,
      status: OrderStatus.PAID,
      paymentIntentId,
    });

    const order = await this.findById(orderId);
    await this.sendConfirmationEmail(order).catch(() => {});
  }

  async markPaymentFailed(orderId: string): Promise<void> {
    await this.ordersRepo.update(orderId, {
      paymentStatus: PaymentStatus.FAILED,
    });
  }

  async setPaymentIntent(
    orderId: string,
    paymentIntentId: string,
  ): Promise<void> {
    await this.ordersRepo.update(orderId, { paymentIntentId });
  }

  // ─── Queries ──────────────────────────────────────────────────────────────────

  async findAll(): Promise<Order[]> {
    return this.ordersRepo.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.ordersRepo.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId?: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found.');
    if (userId && order.userId !== userId) {
      throw new NotFoundException('Order not found.');
    }
    return order;
  }

  async findByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
    return this.ordersRepo.findOne({
      where: { paymentIntentId },
      relations: ['items'],
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findById(id);
    order.status = status;
    return this.ordersRepo.save(order);
  }

  // ─── Shipping costs helper (public for controller) ────────────────────────────

  getShippingCost(method: ShippingMethod): number {
    return SHIPPING_COSTS[method];
  }

  // ─── Email ────────────────────────────────────────────────────────────────────

  private async sendConfirmationEmail(order: Order & { items: OrderItem[] }) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    const { subject, html, text } = orderConfirmationTemplate({
      displayName: null,
      orderId: order.id,
      orderDate: new Date(order.createdAt).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      items: order.items.map((i) => ({
        productName: i.productName,
        variantColorName: i.variantColorName,
        variantSku: i.variantSku,
        quantity: i.quantity,
        priceCents: i.priceCents,
        currency: order.currency,
      })),
      totalCents: order.totalCents,
      currency: order.currency,
      firstName: order.firstName,
      lastName: order.lastName,
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      city: order.city,
      postalCode: order.postalCode,
      country: order.country,
      orderUrl: `${frontendUrl}/orders/${order.id}`,
    });

    await this.mail['send']({ to: order.email, subject, html, text });
  }
}
