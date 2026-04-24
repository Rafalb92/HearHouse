'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/star-rating';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductCategory =
  | 'IN_EAR'
  | 'ON_EAR'
  | 'OVER_EAR'
  | 'OPEN_BACK'
  | 'TRUE_WIRELESS'
  | 'GAMING';

type ProductVariant = {
  id: string;
  colorHex: string;
  colorName: string;
  stock: number;
  isAvailable: boolean;
};

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

type Product = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: ProductCategory;
  basePriceCents: number;
  currency: string;
  shortDescription: string | null;
  avgRating: number;
  reviewCount: number;
  tags: string[];
  variants: ProductVariant[];
  images: ProductImage[];
};

type ProductsPage = {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type Filters = {
  category?: ProductCategory;
  search?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'IN_EAR', label: 'In-Ear' },
  { value: 'ON_EAR', label: 'On-Ear' },
  { value: 'OVER_EAR', label: 'Over-Ear' },
  { value: 'OPEN_BACK', label: 'Open-Back' },
  { value: 'TRUE_WIRELESS', label: 'True Wireless' },
  { value: 'GAMING', label: 'Gaming' },
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest' },
  { value: 'basePriceCents_asc', label: 'Price: Low to High' },
  { value: 'basePriceCents_desc', label: 'Price: High to Low' },
  { value: 'avgRating_desc', label: 'Top Rated' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchProducts(filters: Filters): Promise<ProductsPage> {
  const qs = new URLSearchParams();
  qs.set('page', String(filters.page));
  qs.set('limit', '12');
  if (filters.category) qs.set('category', filters.category);
  if (filters.search) qs.set('search', filters.search);
  if (filters.minPriceCents)
    qs.set('minPriceCents', String(filters.minPriceCents));
  if (filters.maxPriceCents)
    qs.set('maxPriceCents', String(filters.maxPriceCents));
  if (filters.sortBy) qs.set('sortBy', filters.sortBy);
  if (filters.sortOrder) qs.set('sortOrder', filters.sortOrder);

  const res = await fetch(`${API_URL}/products?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json() as Promise<ProductsPage>;
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const mainImage = product.images?.[0];
  const price = (product.basePriceCents / 100).toFixed(2);
  const availableVariants =
    product.variants?.filter((v) => v.isAvailable) ?? [];

  return (
    <div className='group relative'>
      <Link href={`/products/${product.slug}`}>
        <div className='rounded-xl bg-neutral-50 aspect-square overflow-hidden mb-3 relative'>
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt ?? product.name}
              fill
              className='object-contain p-6 transition-transform duration-300 group-hover:scale-105'
              sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            />
          ) : (
            <div className='size-full flex items-center justify-center'>
              <span className='icon-[mingcute--headphone-line] size-16 text-muted-foreground/20' />
            </div>
          )}
        </div>

        <p className='text-xs text-muted-foreground mb-0.5'>{product.brand}</p>
        <h3 className='text-sm font-medium leading-tight mb-1 line-clamp-2'>
          {product.name}
        </h3>

        {product.reviewCount > 0 && (
          <div className='mb-1'>
            <StarRating
              rating={Number(product.avgRating) || 0}
              size='sm'
              reviewCount={product.reviewCount}
            />
          </div>
        )}

        {availableVariants.length > 0 && (
          <div className='flex gap-1 mb-2'>
            {availableVariants.slice(0, 5).map((v) => (
              <span
                key={v.id}
                title={v.colorName}
                className='size-3 rounded-full border border-border'
                style={{ backgroundColor: v.colorHex }}
              />
            ))}
            {availableVariants.length > 5 && (
              <span className='text-xs text-muted-foreground'>
                +{availableVariants.length - 5}
              </span>
            )}
          </div>
        )}

        <p className='text-sm font-semibold'>
          {price} {product.currency}
        </p>
      </Link>

      <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'>
        <WishlistButton productId={product.id} size='sm' />
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className='animate-pulse'>
      <div className='rounded-xl bg-muted aspect-square mb-3' />
      <div className='h-3 bg-muted rounded w-16 mb-1' />
      <div className='h-4 bg-muted rounded w-3/4 mb-2' />
      <div className='h-4 bg-muted rounded w-20' />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [filters, setFilters] = useState<Filters>({ page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  });

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function clearFilters() {
    setFilters({ page: 1 });
    setSearchInput('');
    setPriceMin('');
    setPriceMax('');
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilter('search', searchInput || undefined);
  }

  function handlePriceFilter(e: React.FormEvent) {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      page: 1,
      minPriceCents: priceMin ? Number(priceMin) * 100 : undefined,
      maxPriceCents: priceMax ? Number(priceMax) * 100 : undefined,
    }));
  }

  function handleSort(value: string) {
    const [sortBy, sortOrder] = value.split('_') as [string, 'asc' | 'desc'];
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }

  const hasActiveFilters =
    filters.category ||
    filters.search ||
    filters.minPriceCents ||
    filters.maxPriceCents;

  const currentSort =
    filters.sortBy && filters.sortOrder
      ? `${filters.sortBy}_${filters.sortOrder}`
      : 'createdAt_desc';

  return (
    <div className='max-w-7xl mx-auto px-4 py-12'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Headphones</h1>
        {data && (
          <p className='text-sm text-muted-foreground mt-1'>
            {data.meta.total} products
          </p>
        )}
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* ── Sidebar filters ── */}
        <aside className='w-full lg:w-56 shrink-0'>
          <div className='flex flex-col gap-6'>
            {/* Search */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3'>
                Search
              </p>
              <form onSubmit={handleSearch} className='flex gap-2'>
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder='Brand, model…'
                  className='text-sm'
                />
                <Button type='submit' size='sm' variant='outline'>
                  <span className='icon-[mingcute--search-line] size-4' />
                </Button>
              </form>
            </div>

            {/* Category */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3'>
                Category
              </p>
              <div className='flex flex-col gap-1'>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type='button'
                    onClick={() =>
                      setFilter(
                        'category',
                        filters.category === c.value ? undefined : c.value,
                      )
                    }
                    className={cn(
                      'text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
                      filters.category === c.value
                        ? 'bg-teal-600 text-white font-medium'
                        : 'hover:bg-muted text-muted-foreground',
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3'>
                Price (PLN)
              </p>
              <form
                onSubmit={handlePriceFilter}
                className='flex flex-col gap-2'
              >
                <div className='flex gap-2 items-center'>
                  <Input
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder='Min'
                    type='number'
                    min={0}
                    className='text-sm'
                  />
                  <span className='text-muted-foreground text-sm shrink-0'>
                    —
                  </span>
                  <Input
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder='Max'
                    type='number'
                    min={0}
                    className='text-sm'
                  />
                </div>
                <Button
                  type='submit'
                  size='sm'
                  variant='outline'
                  className='w-full'
                >
                  Apply
                </Button>
              </form>
            </div>

            {hasActiveFilters && (
              <button
                type='button'
                onClick={clearFilters}
                className='text-xs text-destructive hover:underline text-left'
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Products grid ── */}
        <div className='flex-1 min-w-0'>
          {/* Sort bar */}
          <div className='flex items-center justify-end mb-6'>
            <select
              value={currentSort}
              onChange={(e) => handleSort(e.target.value)}
              className='text-sm border border-input rounded-lg px-3 py-1.5 bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
              {[...Array(12)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : !data?.items.length ? (
            <div className='flex flex-col items-center justify-center py-24 gap-3'>
              <span className='icon-[mingcute--search-line] size-12 text-muted-foreground/30' />
              <p className='text-muted-foreground'>No products found.</p>
              {hasActiveFilters && (
                <Button variant='outline' size='sm' onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6',
                isPlaceholderData && 'opacity-60 pointer-events-none',
              )}
            >
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 mt-10'>
              <Button
                variant='outline'
                size='sm'
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                <span className='icon-[mingcute--left-line] size-4' />
              </Button>

              {Array.from({ length: data.meta.totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={filters.page === page ? 'default' : 'outline'}
                    size='sm'
                    className={cn(
                      filters.page === page && 'bg-teal-600 hover:bg-teal-700',
                    )}
                    onClick={() => setFilters((prev) => ({ ...prev, page }))}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant='outline'
                size='sm'
                disabled={filters.page >= data.meta.totalPages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                <span className='icon-[mingcute--right-line] size-4' />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
