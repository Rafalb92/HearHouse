import ConnectorLine from '@/components/home/connector-line';
import FavoriteSection from '@/components/home/favorite-section';
import PresentationCard from '@/components/home/presentation-card';
import PresentationSection from '@/components/home/presentation-section';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export default function Home() {
  return (
    <main className='py-40 w-full max-w-7xl mx-auto flex flex-col items-center gap-6 px-4 text-center'>
      <div className='absolute top-1/2 h-120 left-1/2 -translate-1/2 w-full flex items-center justify-between mx-auto max-w-7xl px-2'>
        <Separator className='bg-black/20' orientation='vertical' />
        <Separator className='bg-black/20' orientation='vertical' />

        <Image
          src='/hero-hear-house.webp'
          alt='hearhouse'
          loading='eager'
          width={900}
          height={1000}
          className='absolute -z-1 top-20 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto h-225 object-cover '
        />
        <span className='absolute -top-20 right-0 w-40 text-right text-md font-medium tracking-wide text-teal-900/60'>
          Best Flagship open Headphone
        </span>
        <div className='absolute -bottom-30 left-0 w-60 text-left text-md font-medium tracking-wide'>
          <span className='text-teal-900/60 block size-40 opacity-70 icon-[garden--quote-fill-12]' />
          <span className='text-black/70 font-medium tracking-wide'>
            Perfect blend of cutting edge technology and innovation
          </span>
        </div>
        <div className='absolute -bottom-30 right-0 w-40 text-right text-md font-medium tracking-wide flex flex-col items-end gap-2'>
          <span className='text-4xl font-semibold'>4.9/5</span>
          <span>300+ Customer Ratings</span>
        </div>
      </div>
      <section
        id='hero'
        className='min-h-dvh flex flex-col items-center gap-6 '
      >
        <div
          id='above-title'
          className='border border-border rounded-full py-1 px-2'
        >
          <span className='text-sm font-medium tracking-wide text-foreground/70'>
            #1 Best audio brand
          </span>
        </div>
        <h1 className='text-4xl font-bold'>Healthy Energy Boosting</h1>
      </section>

      <PresentationSection />
      {/* Favorite Section */}
      <FavoriteSection />
    </main>
  );
}
