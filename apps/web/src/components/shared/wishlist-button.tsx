'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { wishlistApi } from '@/lib/api/wishlist.api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Props = {
  productId: string;
  size?: 'sm' | 'md';
  className?: string;
};

export function WishlistButton({ productId, size = 'md', className }: Props) {
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sprawdź czy produkt jest już w wishlist
  useEffect(() => {
    if (!isAuthenticated) return;
    wishlistApi
      .getIds()
      .then((ids) => {
        setWishlisted(ids.includes(productId));
      })
      .catch(() => {});
  }, [productId, isAuthenticated]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault(); // żeby nie triggerować Link jeśli button jest w karcie
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Sign in to save products to your wishlist.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await wishlistApi.toggle(productId);
      setWishlisted(res.wishlisted);
      toast.success(
        res.wishlisted ? 'Added to wishlist.' : 'Removed from wishlist.',
      );
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  const iconSize = size === 'sm' ? 'size-4' : 'size-5';
  const buttonSize = size === 'sm' ? 'size-8' : 'size-10';

  return (
    <button
      type='button'
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'rounded-full flex items-center justify-center transition-all',
        'border border-border bg-background hover:bg-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonSize,
        className,
      )}
    >
      <span
        className={cn(
          iconSize,
          'transition-colors',
          wishlisted
            ? 'icon-[mingcute--heart-fill] text-rose-500'
            : 'icon-[mingcute--heart-line] text-muted-foreground',
        )}
      />
    </button>
  );
}
