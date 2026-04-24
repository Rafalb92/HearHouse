import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { WishlistButton } from '@/components/shared/wishlist-button';
import type { Product } from '@/lib/api/admin-products.api';
import { StarRating } from '../ui/star-rating';

type Props = {
  product: Product;
};

const FavoriteProductCard = ({ product }: Props) => {
  const mainImage = product.images?.[0];
  const price = (product.basePriceCents / 100).toFixed(2);
  const rating = Math.round(product.avgRating ?? 0);

  return (
    <div className='p-1'>
      <Card className='p-0 border-none shadow-none rounded-xl'>
        <CardContent className='flex flex-col aspect-square items-center justify-center rounded-xl bg-neutral-50 p-6 relative'>
          {/* Wishlist button */}
          <div className='absolute top-3 right-3'>
            <WishlistButton productId={product.id} size='sm' />
          </div>

          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt ?? product.name}
              width={350}
              height={350}
              className='object-cover'
            />
          ) : (
            <div className='size-full flex items-center justify-center text-muted-foreground'>
              <span className='icon-[mingcute--headphone-line] size-16 opacity-20' />
            </div>
          )}

          <div className='flex items-center justify-between mt-4 w-full px-6'>
            <Button variant='outline' className='mr-2 flex items-center gap-2'>
              <span>Buy Now!</span>
              <span className='icon-[mingcute--basket-line] size-5' />
            </Button>
            <div className='bg-teal-600 text-white px-4 py-2 rounded-md'>
              {price} {product.currency}
            </div>
          </div>
        </CardContent>
      </Card>

      <h4 className='mt-2 text-lg font-medium text-left'>{product.name}</h4>

      <div className='mt-1 flex items-center justify-between'>
        <div className='flex items-center gap-1'>
          <StarRating
            rating={product.avgRating ?? 0}
            size='sm'
            reviewCount={product.reviewCount}
          />

          {product.reviewCount > 0 && (
            <span className='text-xs text-muted-foreground ml-1'>
              ({product.reviewCount})
            </span>
          )}
        </div>
        <Button asChild variant='link'>
          <Link href={`/products/${product.slug}`}>Detail</Link>
        </Button>
      </div>
    </div>
  );
};

export default FavoriteProductCard;
