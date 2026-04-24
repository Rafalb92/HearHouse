import { apiClient } from '@/lib/api/client';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ProductCategory =
  | 'IN_EAR'
  | 'ON_EAR'
  | 'OVER_EAR'
  | 'OPEN_BACK'
  | 'TRUE_WIRELESS'
  | 'GAMING';

export type ProductVariant = {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  finish: string | null;
  materials: Record<string, string> | null;
  priceDeltaCents: number;
  stock: number;
  isAvailable: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  publicId: string;
  alt: string | null;
  sortOrder: number;
  variantId: string | null;
  width: number | null;
  height: number | null;
};

export type Product = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  name: string;
  category: ProductCategory;
  status: ProductStatus;
  shortDescription: string | null;
  description: string | null;
  currency: string;
  basePriceCents: number;
  specs: Record<string, unknown> | null;
  tags: string[];
  featured: boolean;
  avgRating: number;
  reviewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductsPage = {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateVariantInput = {
  sku: string;
  colorName: string;
  colorHex: string;
  finish?: string;
  materials?: Record<string, string>;
  priceDeltaCents?: number;
  stock: number;
  isAvailable?: boolean;
};

export type CreateProductInput = {
  slug?: string;
  brand: string;
  model: string;
  name?: string;
  category: ProductCategory;
  status?: ProductStatus;
  shortDescription?: string;
  description?: string;
  currency?: string;
  basePriceCents: number;
  specs?: Record<string, unknown>;
  tags?: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  variants: CreateVariantInput[];
};

export type UpdateProductInput = Partial<Omit<CreateProductInput, 'variants'>>;

export type AddImageInput = {
  url: string;
  publicId: string;
  alt?: string;
  variantId?: string;
  sortOrder?: number;
  width?: number;
  height?: number;
};

export const adminProductsApi = {
  list(params?: { page?: number; limit?: number }): Promise<ProductsPage> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiClient<ProductsPage>(`/admin/products${q ? `?${q}` : ''}`);
  },

  get(id: string): Promise<Product> {
    return apiClient<Product>(`/admin/products/${id}`);
  },

  create(data: CreateProductInput): Promise<Product> {
    return apiClient<Product>('/admin/products', {
      method: 'POST',
      body: data,
    });
  },

  update(id: string, data: UpdateProductInput): Promise<Product> {
    return apiClient<Product>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  remove(id: string): Promise<void> {
    return apiClient<void>(`/admin/products/${id}`, { method: 'DELETE' });
  },

  addImage(id: string, data: AddImageInput): Promise<ProductImage> {
    return apiClient<ProductImage>(`/admin/products/${id}/images`, {
      method: 'POST',
      body: data,
    });
  },

  removeImage(id: string, imageId: string): Promise<void> {
    return apiClient<void>(`/admin/products/${id}/images/${imageId}`, {
      method: 'DELETE',
    });
  },

  reorderImages(id: string, imageIds: string[]): Promise<ProductImage[]> {
    return apiClient<ProductImage[]>(`/admin/products/${id}/images/reorder`, {
      method: 'PATCH',
      body: { imageIds },
    });
  },

  addVariant(id: string, data: CreateVariantInput): Promise<ProductVariant> {
    return apiClient<ProductVariant>(`/admin/products/${id}/variants`, {
      method: 'POST',
      body: data,
    });
  },

  removeVariant(id: string, variantId: string): Promise<void> {
    return apiClient<void>(`/admin/products/${id}/variants/${variantId}`, {
      method: 'DELETE',
    });
  },
};
