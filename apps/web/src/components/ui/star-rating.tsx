import { cn } from '@/lib/utils';

type Props = {
  rating: number; // np. 4.3
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
};

export function StarRating({
  rating: ratingRaw,
  max = 5,
  size = 'md',
  showValue = false,
  reviewCount,
}: Props) {
  const sizeClass = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-6',
  }[size];
  const rating = Number(ratingRaw) || 0;
  return (
    <div className='flex items-center gap-1.5'>
      <div className='flex items-center gap-0.5'>
        {Array.from({ length: max }).map((_, i) => {
          const fill = Math.min(Math.max(rating - i, 0), 1); // 0, 0.x, lub 1
          return <Star key={i} fill={fill} className={sizeClass} />;
        })}
      </div>

      {(showValue || reviewCount !== undefined) && (
        <span className='text-xs text-muted-foreground leading-none'>
          {showValue && (
            <span className='font-medium text-foreground'>
              {rating.toFixed(1)}
            </span>
          )}
          {showValue && reviewCount !== undefined && (
            <span className='mx-1'>·</span>
          )}
          {reviewCount !== undefined && (
            <span>
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

// ─── Single star z partial fill ───────────────────────────────────────────────

function Star({ fill, className }: { fill: number; className: string }) {
  // fill: 0 = empty, 1 = full, 0.x = partial
  const id = `star-${Math.random().toString(36).slice(2, 7)}`;

  if (fill >= 1) {
    return (
      <span
        className={cn('icon-[mingcute--star-fill] text-amber-400', className)}
      />
    );
  }

  if (fill <= 0) {
    return (
      <span
        className={cn('icon-[mingcute--star-fill] text-gray-200', className)}
      />
    );
  }

  // Partial — overlay: pełna szara gwiazdka + złota przycinana do fill%
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {/* Tło — pusta gwiazdka */}
      <span
        className={cn(
          'icon-[mingcute--star-fill] text-gray-200 absolute inset-0',
          className,
        )}
      />
      {/* Wypełnienie — złota gwiazdka przycięta */}
      <span
        className={cn(
          'icon-[mingcute--star-fill] text-amber-400 relative',
          className,
        )}
        style={{
          clipPath: `inset(0 ${100 - fill * 100}% 0 0)`,
        }}
      />
    </span>
  );
}
