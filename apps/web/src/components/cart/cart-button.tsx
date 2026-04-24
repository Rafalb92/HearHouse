'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CartButton() {
  const count = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      asChild
      variant='ghost'
      size='icon'
      className='rounded-full size-10 relative'
    >
      <Link href='/cart' aria-label='Cart'>
        <span className='icon-[mingcute--basket-line] size-6' />
        {mounted && count > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 size-5 rounded-full',
              'bg-teal-600 text-white text-xs font-bold',
              'flex items-center justify-center leading-none',
            )}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
