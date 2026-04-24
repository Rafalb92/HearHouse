'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  adminProductsApi,
  type Product,
  type ProductsPage,
} from '@/lib/api/admin-products.api';
import { ApiError } from '@/lib/errors/api-error';
import { Button } from '@/components/ui/button';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  },
  DRAFT: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
  },
  ARCHIVED: {
    label: 'Archived',
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  },
};

export default function AdminProductsPage() {
  const [data, setData] = useState<ProductsPage | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    adminProductsApi
      .list({ page, limit: 20 })
      .then(setData)
      .catch(() => toast.error('Failed to load products.'))
      .finally(() => setIsLoading(false));
  }, [page]);

  async function handleDelete(product: Product) {
    if (
      !confirm(
        `Delete "${product.name}"? This will also remove all images from Cloudinary.`,
      )
    )
      return;

    setDeletingId(product.id);
    try {
      await adminProductsApi.remove(product.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((p) => p.id !== product.id),
              meta: { ...prev.meta, total: prev.meta.total - 1 },
            }
          : prev,
      );
      toast.success('Product deleted.');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Failed to delete.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>Products</h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {data ? `${data.meta.total} total` : '…'}
          </p>
        </div>
        <Button asChild>
          <Link href='/admin/products/new'>
            <span className='icon-[mingcute--add-line] size-4 mr-1.5' />
            Add product
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className='rounded-lg border overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='text-left px-4 py-3 font-medium text-muted-foreground'>
                Product
              </th>
              <th className='text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell'>
                Category
              </th>
              <th className='text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell'>
                Price
              </th>
              <th className='text-left px-4 py-3 font-medium text-muted-foreground'>
                Status
              </th>
              <th className='text-right px-4 py-3 font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className='px-4 py-3'>
                    <div className='h-4 bg-muted animate-pulse rounded w-3/4' />
                  </td>
                </tr>
              ))}

            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className='px-4 py-12 text-center text-muted-foreground'
                >
                  No products yet.{' '}
                  <Link
                    href='/admin/products/new'
                    className='underline underline-offset-4'
                  >
                    Add your first product
                  </Link>
                </td>
              </tr>
            )}

            {!isLoading &&
              data?.items.map((product) => {
                const badge = STATUS_BADGE[product.status];
                const mainImage = product.images?.[0];
                const price = (product.basePriceCents / 100).toFixed(2);

                return (
                  <tr
                    key={product.id}
                    className='hover:bg-muted/30 transition-colors'
                  >
                    {/* Product */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        {mainImage ? (
                          <img
                            src={mainImage.url}
                            alt={mainImage.alt ?? product.name}
                            className='size-10 rounded object-cover shrink-0 bg-muted'
                          />
                        ) : (
                          <div className='size-10 rounded bg-muted shrink-0 flex items-center justify-center'>
                            <span className='icon-[mingcute--image-line] size-5 text-muted-foreground' />
                          </div>
                        )}
                        <div className='min-w-0'>
                          <p className='font-medium truncate'>{product.name}</p>
                          <p className='text-xs text-muted-foreground truncate'>
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className='px-4 py-3 hidden md:table-cell text-muted-foreground'>
                      {product.category.replace('_', ' ')}
                    </td>

                    {/* Price */}
                    <td className='px-4 py-3 hidden lg:table-cell'>
                      {price} {product.currency}
                    </td>

                    {/* Status */}
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className='px-4 py-3 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button variant='ghost' size='sm' asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive hover:text-destructive'
                          disabled={deletingId === product.id}
                          onClick={() => handleDelete(product)}
                        >
                          {deletingId === product.id ? '…' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className='flex items-center justify-between mt-4'>
          <p className='text-sm text-muted-foreground'>
            Page {page} of {data.meta.totalPages}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page === data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
