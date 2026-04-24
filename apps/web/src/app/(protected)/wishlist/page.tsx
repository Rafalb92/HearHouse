'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wishlistApi, type WishlistItem } from '@/lib/api/wishlist.api';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    wishlistApi
      .getWishlist()
      .then(setItems)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='h-8 w-48 bg-muted animate-pulse rounded mb-8' />
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-64 bg-muted animate-pulse rounded-xl' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>My Wishlist</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          {items.length === 0
            ? 'No saved products yet.'
            : `${items.length} saved product${items.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 gap-4'>
          <span className='icon-[mingcute--heart-line] size-16 text-muted-foreground/30' />
          <p className='text-muted-foreground'>
            Save products you love to find them easily later.
          </p>
          <Button asChild variant='outline'>
            <Link href='/products'>Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {items.map((item) => {
            const product = item.product;
            const mainImage = product.images?.[0];
            const price = (product.basePriceCents / 100).toFixed(2);

            return (
              <div key={item.id} className='group relative'>
                <Link href={`/products/${product.slug}`}>
                  <div className='rounded-xl bg-neutral-50 aspect-square overflow-hidden mb-3 relative'>
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={mainImage.alt ?? product.name}
                        fill
                        className='object-contain p-6 transition-transform group-hover:scale-105'
                        sizes='(max-width: 640px) 100vw, 33vw'
                      />
                    ) : (
                      <div className='size-full flex items-center justify-center'>
                        <span className='icon-[mingcute--headphone-line] size-16 text-muted-foreground/20' />
                      </div>
                    )}
                  </div>
                  <h3 className='font-medium text-sm leading-tight'>
                    {product.name}
                  </h3>
                  <p className='text-sm text-muted-foreground mt-0.5'>
                    {price} {product.currency}
                  </p>
                </Link>

                {/* Wishlist toggle — usuwa z listy */}
                <div className='absolute top-3 right-3'>
                  <WishlistButton
                    productId={product.id}
                    size='sm'
                    className='opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
