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
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/auth/types/auth-user.type';
import { CreateReviewDto, UpdateReviewDto } from './dto/reviews.dto';
// import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt-auth.guard';

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  // GET /products/:productId/reviews — publiczne
  @Get()
  getReviews(@Param('productId') productId: string) {
    return this.reviews.getProductReviews(productId);
  }

  // GET /products/:productId/reviews/mine — moja recenzja
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMyReview(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
  ) {
    return this.reviews.getUserReviewForProduct(user.id, productId);
  }

  // POST /products/:productId/reviews
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(user.id, productId, dto);
  }

  // PATCH /products/:productId/reviews/:reviewId
  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: AuthUser,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviews.update(user.id, reviewId, dto);
  }

  // DELETE /products/:productId/reviews/:reviewId
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('reviewId') reviewId: string,
  ) {
    await this.reviews.remove(user.id, reviewId);
  }
}
