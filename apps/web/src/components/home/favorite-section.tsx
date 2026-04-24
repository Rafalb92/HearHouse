import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import FavoriteProductCard from './favorite-product-card';
import type { Product } from '@/lib/api/admin-products.api';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.API_URL ?? 'http://localhost:3001'}/products/featured`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Product[];
    return data.slice(0, 5);
  } catch {
    return [];
  }
}

const FavoriteSection = async () => {
  const products = await getFeaturedProducts();

  if (!products.length) return null;

  return (
    <section className='w-full max-w-7xl mx-auto pb-50 relative'>
      <h2 className='mb-4 text-4xl font-semibold text-left'>
        Meet your new <br /> Favorite Headphones
      </h2>
      <Carousel
        opts={{
          align: 'start',
          watchDrag: false,
        }}
        className='w-full'
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} className='basis-1/2 lg:basis-1/3'>
              <FavoriteProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='absolute right-30 ml-auto -top-10' />
        <CarouselNext className='absolute right-10 ml-auto -top-10' />
      </Carousel>
    </section>
  );
};

export default FavoriteSection;
