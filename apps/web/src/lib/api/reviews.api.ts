import { apiClient } from '@/lib/api/client';

export type Review = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string | null;
    email: string;
  };
};

export const reviewsApi = {
  getProductReviews(productId: string): Promise<Review[]> {
    return apiClient<Review[]>(`/products/${productId}/reviews`);
  },

  getMyReview(productId: string): Promise<Review | null> {
    return apiClient<Review | null>(`/products/${productId}/reviews/mine`);
  },

  create(
    productId: string,
    data: { rating: number; comment?: string },
  ): Promise<Review> {
    return apiClient<Review>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: data,
    });
  },

  update(
    productId: string,
    reviewId: string,
    data: { rating?: number; comment?: string },
  ): Promise<Review> {
    return apiClient<Review>(`/products/${productId}/reviews/${reviewId}`, {
      method: 'PATCH',
      body: data,
    });
  },

  remove(productId: string, reviewId: string): Promise<void> {
    return apiClient<void>(`/products/${productId}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};
