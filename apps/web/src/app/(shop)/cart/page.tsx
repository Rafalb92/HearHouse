'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalCents, totalItems } =
    useCartStore();

  const currency = items[0]?.currency ?? 'PLN';
  const total = (totalCents() / 100).toFixed(2);

  if (items.length === 0) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-24 flex flex-col items-center gap-4'>
        <span className='icon-[mingcute--basket-line] size-16 text-muted-foreground/30' />
        <h1 className='text-xl font-bold'>Your cart is empty</h1>
        <p className='text-sm text-muted-foreground'>
          Add some headphones to get started.
        </p>
        <Button asChild variant='outline'>
          <Link href='/products'>Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <h1 className='text-2xl font-bold tracking-tight mb-8'>
        Cart ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
      </h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Items */}
        <div className='lg:col-span-2 flex flex-col gap-4'>
          {items.map((item) => (
            <div
              key={item.variantId}
              className='flex gap-4 rounded-xl border p-4'
            >
              {/* Image */}
              <div className='relative size-20 shrink-0 rounded-lg bg-neutral-50 overflow-hidden'>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className='object-contain p-2'
                    sizes='80px'
                  />
                ) : (
                  <div className='size-full flex items-center justify-center'>
                    <span className='icon-[mingcute--headphone-line] size-8 text-muted-foreground/20' />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-sm leading-tight truncate'>
                  {item.productName}
                </p>
                <div className='flex items-center gap-2 mt-1'>
                  <span
                    className='size-3 rounded-full border border-border shrink-0'
                    style={{ backgroundColor: item.variantColorHex }}
                  />
                  <p className='text-xs text-muted-foreground'>
                    {item.variantColorName} · {item.variantSku}
                  </p>
                </div>
                <p className='text-sm font-semibold mt-2'>
                  {((item.priceCents * item.quantity) / 100).toFixed(2)}{' '}
                  {item.currency}
                </p>
              </div>

              {/* Quantity + remove */}
              <div className='flex flex-col items-end justify-between shrink-0'>
                <button
                  type='button'
                  onClick={() => removeItem(item.variantId)}
                  className='text-muted-foreground hover:text-destructive transition-colors'
                >
                  <span className='icon-[mingcute--close-line] size-4' />
                </button>

                <div className='flex items-center gap-2 border rounded-lg overflow-hidden'>
                  <button
                    type='button'
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className='px-2.5 py-1.5 text-sm hover:bg-muted transition-colors'
                  >
                    −
                  </button>
                  <span className='text-sm font-medium w-6 text-center'>
                    {item.quantity}
                  </span>
                  <button
                    type='button'
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className='px-2.5 py-1.5 text-sm hover:bg-muted transition-colors'
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className='lg:col-span-1'>
          <div className='rounded-xl border p-6 sticky top-24'>
            <h2 className='text-sm font-semibold mb-4'>Order summary</h2>

            <div className='flex flex-col gap-2 text-sm mb-4'>
              {items.map((item) => (
                <div key={item.variantId} className='flex justify-between'>
                  <span className='text-muted-foreground truncate mr-2'>
                    {item.productName} ×{item.quantity}
                  </span>
                  <span className='shrink-0'>
                    {((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className='border-t pt-4 flex justify-between font-bold text-base'>
              <span>Total</span>
              <span>
                {total} {currency}
              </span>
            </div>

            <Button
              asChild
              className='w-full mt-6 bg-teal-600 hover:bg-teal-700'
            >
              <Link href='/checkout'>Proceed to checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
