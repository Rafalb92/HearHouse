import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { UploadModule } from '@/upload/upload.module';
import { ProductsAdminController } from './products.admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, ProductImage]),
    UploadModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController, ProductsAdminController],
  exports: [ProductsService],
})
export class ProductsModule {}
