import {
  BadRequestException,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '@/orders/orders.service';
import { ShippingMethod } from '@/orders/entities/order.entity';
import type { Request } from 'express';
import { PaymentStatus } from '@/orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly orders: OrdersService,
  ) {
    this.stripe = new Stripe(
      this.config.getOrThrow<string>('SECRET_STRIPE_KEY'),
      { apiVersion: '2026-03-25.dahlia' },
    );
    this.webhookSecret = this.config.getOrThrow<string>(
      'SECRET_STRIPE_WEBHOOK_KEY',
    );
  }

  // ─── Create PaymentIntent ─────────────────────────────────────────────────────

  async createPaymentIntent(
    orderId: string,
    userId: string,
  ): Promise<{ clientSecret: string; publishableKey: string }> {
    const order = await this.orders.findById(orderId, userId);

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid.');
    }

    // Jeśli mamy już paymentIntentId — pobierz istniejący
    if (order.paymentIntentId) {
      const existing = await this.stripe.paymentIntents.retrieve(
        order.paymentIntentId,
      );
      if (existing.status !== 'succeeded' && existing.status !== 'canceled') {
        return {
          clientSecret: existing.client_secret!,
          publishableKey: this.config.getOrThrow('PUBLISHABLE_STRIPE_KEY'),
        };
      }
    }

    // Stwórz nowy PaymentIntent
    const intent = await this.stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: order.currency.toLowerCase(),
      metadata: { orderId: order.id },
      automatic_payment_methods: { enabled: true },
    });

    await this.orders.setPaymentIntent(order.id, intent.id);

    return {
      clientSecret: intent.client_secret!,
      publishableKey: this.config.getOrThrow('PUBLISHABLE_STRIPE_KEY'),
    };
  }

  // ─── Get shipping options ─────────────────────────────────────────────────────

  getShippingOptions() {
    return [
      {
        method: ShippingMethod.PICKUP,
        label: 'Store pickup',
        description: 'Pick up at our store in Warsaw',
        priceCents: 0,
      },
      {
        method: ShippingMethod.COURIER,
        label: 'Courier delivery',
        description: 'Delivery within 2-3 business days',
        priceCents: 1500,
      },
    ];
  }

  // ─── Webhook ──────────────────────────────────────────────────────────────────

  async handleWebhook(req: RawBodyRequest<Request>): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        sig,
        this.webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature.');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await this.orders.markAsPaid(orderId, intent.id);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await this.orders.markPaymentFailed(orderId);
        }
        break;
      }
      default:
        break;
    }
  }
}
