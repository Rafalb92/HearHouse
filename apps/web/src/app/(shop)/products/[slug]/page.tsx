import { notFound } from 'next/navigation';
import type { Product } from '@/lib/api/admin-products.api';
import { VariantSelector } from '@/components/products/variant-selector';
import { SpecsTable } from '@/components/products/specs-table';
import { ProductGallery } from '@/components/products/product-gallery';
import { StarRating } from '@/components/ui/star-rating';
import { ReviewsSection } from '@/components/products/reviews-section';

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.API_URL ?? 'http://localhost:3001'}/products/${slug}`,
      { next: { revalidate: 60 } },
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json() as Promise<Product>;
  } catch {
    return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const basePrice = (product.basePriceCents / 100).toFixed(2);

  return (
    <div className='max-w-7xl mx-auto px-4 py-12'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {/* ── Left: Gallery ── */}
        <ProductGallery images={product.images ?? []} name={product.name} />

        {/* ── Right: Info ── */}
        <div className='flex flex-col gap-6'>
          {/* Brand + name */}
          <div>
            <p className='text-sm text-muted-foreground uppercase tracking-widest mb-1'>
              {product.brand}
            </p>
            <h1 className='text-3xl font-bold tracking-tight'>
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className='mt-2'>
                <StarRating
                  rating={product.avgRating}
                  size='md'
                  showValue
                  reviewCount={product.reviewCount}
                />
              </div>
            )}
          </div>

          {/* Price */}
          <div className='flex items-baseline gap-2'>
            <span className='text-4xl font-bold tracking-tight'>
              {basePrice}
            </span>
            <span className='text-lg text-muted-foreground'>
              {product.currency}
            </span>
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className='text-muted-foreground leading-relaxed'>
              {product.shortDescription}
            </p>
          )}

          {/* Variant selector */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              currency={product.currency}
              basePriceCents={product.basePriceCents}
              productId={product.id}
              mainImageUrl={product.images?.[0].url ?? ''}
              productName={product.name}
            />
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className='text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className='border-t' />

          {/* Full description */}
          {product.description && (
            <div>
              <h2 className='text-sm font-semibold mb-2'>About this product</h2>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Specs ── */}
      {product.specs && (
        <div className='mt-16'>
          <h2 className='text-2xl font-bold tracking-tight mb-6'>
            Specifications
          </h2>
          <SpecsTable specs={product.specs} />
        </div>
      )}

      {/* ── Reviews ── */}
      <div className='mt-16'>
        <h2 className='text-2xl font-bold tracking-tight mb-6'>Reviews</h2>
        <ReviewsSection productId={product.id} />
      </div>
    </div>
  );
}
