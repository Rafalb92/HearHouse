'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ProductVariant } from '@/lib/api/admin-products.api';
import { cn } from '@/lib/utils';
import { WishlistButton } from '../shared/wishlist-button';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';

type Props = {
  variants: ProductVariant[];
  basePriceCents: number;
  currency: string;
  productId: string;
  productName: string;
  mainImageUrl?: string;
};

export function VariantSelector({
  variants,
  basePriceCents,
  currency,
  productId,
  productName,
  mainImageUrl,
}: Props) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? null);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const totalCents = basePriceCents + (selected?.priceDeltaCents ?? 0);
  const totalPrice = (totalCents / 100).toFixed(2);

  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      productId,
      variantId: selected.id,
      productName: productName,
      variantSku: selected.sku,
      variantColorName: selected.colorName,
      variantColorHex: selected.colorHex,
      imageUrl: mainImageUrl ?? null,
      priceCents: totalCents,
      currency,
    });
    toast.success('Added to cart!');
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Color selector */}
      <div>
        <p className='text-sm font-medium mb-2'>
          Color —{' '}
          <span className='text-muted-foreground font-normal'>
            {selected?.colorName}
          </span>
        </p>
        <div className='flex gap-2 flex-wrap'>
          {variants.map((v) => (
            <button
              key={v.id}
              type='button'
              title={v.colorName}
              onClick={() => setSelectedId(v.id)}
              className={cn(
                'relative size-9 rounded-full border-2 transition-all',
                v.id === selectedId
                  ? 'border-teal-600 scale-110'
                  : 'border-transparent hover:border-muted-foreground/40',
                !v.isAvailable && 'opacity-40 cursor-not-allowed',
              )}
              disabled={!v.isAvailable}
            >
              <span
                className='absolute inset-1 rounded-full'
                style={{ backgroundColor: v.colorHex }}
              />
              {!v.isAvailable && (
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='icon-[mingcute--close-line] size-3 text-white drop-shadow' />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stock info */}
      {selected && (
        <p className='text-sm text-muted-foreground'>
          {selected.stock > 10 ? (
            <span className='text-teal-600 font-medium'>In stock</span>
          ) : selected.stock > 0 ? (
            <span className='text-amber-500 font-medium'>
              Only {selected.stock} left
            </span>
          ) : (
            <span className='text-destructive font-medium'>Out of stock</span>
          )}
        </p>
      )}

      {/* Price with delta */}
      {selected?.priceDeltaCents !== 0 && (
        <p className='text-sm text-muted-foreground'>
          Price for this variant:{' '}
          <span className='font-semibold text-foreground'>
            {totalPrice} {currency}
          </span>
        </p>
      )}

      {/* CTA */}
      <div className='flex gap-3 mt-2'>
        <Button
          className='flex-1 bg-teal-600 hover:bg-teal-700 text-white'
          disabled={!selected?.isAvailable}
          onClick={handleAddToCart}
        >
          <span className='icon-[mingcute--basket-line] size-5 mr-2' />
          Add to cart
        </Button>
        <WishlistButton productId={productId} />
      </div>
    </div>
  );
}
