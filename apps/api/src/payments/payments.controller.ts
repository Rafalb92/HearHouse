import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  type RawBodyRequest,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/auth/types/auth-user.type';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  // GET /payments/shipping-options — publiczne
  @Get('shipping-options')
  getShippingOptions() {
    return this.payments.getShippingOptions();
  }

  // POST /payments/create-intent/:orderId — wymaga logowania
  @Post('create-intent/:orderId')
  @UseGuards(JwtAuthGuard)
  createIntent(
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.payments.createPaymentIntent(orderId, user.id);
  }

  // POST /payments/webhook — Stripe webhook (bez auth, raw body)
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(@Req() req: RawBodyRequest<Request>) {
    return this.payments.handleWebhook(req);
  }
}
