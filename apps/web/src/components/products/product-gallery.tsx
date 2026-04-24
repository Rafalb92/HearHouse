'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/lib/api/admin-products.api';
import { cn } from '@/lib/utils';

type Props = {
  images: ProductImage[];
  name: string;
};

export function ProductGallery({ images, name }: Props) {
  const [selected, setSelected] = useState(0);

  if (!images.length) {
    return (
      <div className='aspect-square rounded-2xl bg-neutral-100 flex items-center justify-center'>
        <span className='icon-[mingcute--headphone-line] size-24 text-muted-foreground/20' />
      </div>
    );
  }

  const main = images[selected];

  return (
    <div className='flex flex-col gap-4'>
      {/* Main image */}
      <div className='relative aspect-square rounded-2xl bg-neutral-50 overflow-hidden'>
        <Image
          src={main.url}
          alt={main.alt ?? name}
          fill
          className='object-contain p-6'
          priority
          sizes='(max-width: 1024px) 100vw, 50vw'
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className='flex gap-3 overflow-x-auto pb-1'>
          {images.map((img, i) => (
            <button
              key={img.id}
              type='button'
              onClick={() => setSelected(i)}
              className={cn(
                'relative shrink-0 size-20 rounded-xl overflow-hidden bg-neutral-50 border-2 transition-colors',
                i === selected
                  ? 'border-teal-600'
                  : 'border-transparent hover:border-muted-foreground/30',
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${name} ${i + 1}`}
                fill
                className='object-contain p-2'
                sizes='80px'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
