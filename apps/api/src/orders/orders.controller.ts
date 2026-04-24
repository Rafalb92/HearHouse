import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/orders.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/auth/types/auth-user.type';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  // POST /orders — checkout (opcjonalnie zalogowany)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthUser) {
    console.log(dto);

    return this.orders.create(dto, user.id);
  }

  // GET /orders — historia zamówień (wymaga logowania)
  @Get()
  @UseGuards(JwtAuthGuard)
  findMyOrders(@CurrentUser() user: AuthUser) {
    return this.orders.findByUser(user.id);
  }

  // GET /orders/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.orders.findById(id, user.id);
  }
}
