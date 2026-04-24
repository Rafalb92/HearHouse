import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthUser } from '@/auth/types/auth-user.type';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  // GET /wishlist — pełna lista z produktami
  @Get()
  getWishlist(@CurrentUser() user: AuthUser) {
    return this.wishlist.getWishlist(user.id);
  }

  // GET /wishlist/ids — tylko id produktów (do sprawdzania stanu serca)
  @Get('ids')
  getIds(@CurrentUser() user: AuthUser) {
    return this.wishlist.getWishlistProductIds(user.id);
  }

  // POST /wishlist/:productId — toggle (add/remove)
  @Post(':productId')
  toggle(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlist.toggle(user.id, productId);
  }

  // DELETE /wishlist/:productId — usuń z listy
  @Delete(':productId')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
  ) {
    await this.wishlist.remove(user.id, productId);
    return { ok: true };
  }
}
