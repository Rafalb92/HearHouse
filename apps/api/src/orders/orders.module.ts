import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Product } from '@/products/entities/product.entity';
import { ProductVariant } from '@/products/entities/product-variant.entity';
import { MailModule } from '@/mail/mail.module';
import { OrdersAdminController } from './orders-admin.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, ProductVariant]),
    MailModule,
  ],
  controllers: [OrdersController, OrdersAdminController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
