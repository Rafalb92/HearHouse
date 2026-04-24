import { apiClient } from '@/lib/api/client';
import type { Product } from '@/lib/api/admin-products.api';

export type WishlistItem = {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
};

export const wishlistApi = {
  getWishlist(): Promise<WishlistItem[]> {
    return apiClient<WishlistItem[]>('/wishlist');
  },

  getIds(): Promise<string[]> {
    return apiClient<string[]>('/wishlist/ids');
  },

  toggle(productId: string): Promise<{ wishlisted: boolean }> {
    return apiClient<{ wishlisted: boolean }>(`/wishlist/${productId}`, {
      method: 'POST',
    });
  },

  remove(productId: string): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },
};
