import { apiClient } from '@/lib/api/client';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderItem = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantSku: string;
  variantColorName: string;
  variantColorHex: string;
  imageUrl: string | null;
  priceCents: number;
  quantity: number;
};

export type Order = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  country: string;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

export type CreateOrderInput = {
  email: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: 'PICKUP' | 'COURIER';
  notes?: string;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
};

export const ordersApi = {
  create(data: CreateOrderInput): Promise<Order> {
    return apiClient<Order>('/orders', { method: 'POST', body: data });
  },

  list(): Promise<Order[]> {
    return apiClient<Order[]>('/orders');
  },

  get(id: string): Promise<Order> {
    return apiClient<Order>(`/orders/${id}`);
  },
};
