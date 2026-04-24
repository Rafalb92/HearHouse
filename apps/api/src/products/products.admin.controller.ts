import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/users/entities/user.entity';
import {
  AddImageDto,
  CreateProductDto,
  CreateVariantDto,
  ProductQueryDto,
  ReorderImagesDto,
  UpdateProductDto,
  UpdateVariantDto,
} from './dto/products.dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ProductsAdminController {
  constructor(private readonly products: ProductsService) {}

  // ─── Products ─────────────────────────────────────────────────────────────────

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.products.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.products.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.products.remove(id);
  }

  // ─── Variants ─────────────────────────────────────────────────────────────────

  @Post(':id/variants')
  @HttpCode(HttpStatus.CREATED)
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.products.addVariant(id, dto);
  }

  @Patch(':id/variants/:variantId')
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.products.updateVariant(id, variantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    await this.products.removeVariant(id, variantId);
  }

  // ─── Images ───────────────────────────────────────────────────────────────────

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  addImage(@Param('id') id: string, @Body() dto: AddImageDto) {
    return this.products.addImage(id, dto);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    await this.products.removeImage(id, imageId);
  }

  @Patch(':id/images/reorder')
  reorderImages(@Param('id') id: string, @Body() dto: ReorderImagesDto) {
    return this.products.reorderImages(id, dto);
  }
}
