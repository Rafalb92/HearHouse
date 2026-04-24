import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly repo: Repository<WishlistItem>,
  ) {}

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return this.repo.find({
      where: { userId },
      relations: ['product', 'product.images', 'product.variants'],
      order: { createdAt: 'DESC' },
    });
  }

  async getWishlistProductIds(userId: string): Promise<string[]> {
    const items = await this.repo.find({
      where: { userId },
      select: ['productId'],
    });
    return items.map((i) => i.productId);
  }

  async toggle(
    userId: string,
    productId: string,
  ): Promise<{ wishlisted: boolean }> {
    const existing = await this.repo.findOne({
      where: { userId, productId },
    });

    if (existing) {
      await this.repo.remove(existing);
      return { wishlisted: false };
    }

    await this.repo.save(this.repo.create({ userId, productId }));
    return { wishlisted: true };
  }

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, productId } });
    return count > 0;
  }

  async remove(userId: string, productId: string): Promise<void> {
    await this.repo.delete({ userId, productId });
  }
}
