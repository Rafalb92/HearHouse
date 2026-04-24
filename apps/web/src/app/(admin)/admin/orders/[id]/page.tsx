'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/lib/api/orders.api';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/errors/api-error';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');

  useEffect(() => {
    apiClient<Order>(`/admin/orders/${params.id}`)
      .then((o) => {
        setOrder(o);
        setSelectedStatus(o.status);
      })
      .catch(() => router.push('/admin/orders'))
      .finally(() => setIsLoading(false));
  }, [params.id, router]);

  async function handleStatusUpdate() {
    if (!order || selectedStatus === order.status) return;
    setIsUpdating(true);
    try {
      const updated = await apiClient<Order>(
        `/admin/orders/${order.id}/status`,
        { method: 'PATCH', body: { status: selectedStatus } },
      );
      setOrder(updated);
      toast.success('Status updated.');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='h-24 bg-muted animate-pulse rounded-xl' />
        ))}
      </div>
    );
  }

  if (!order) return null;

  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className='max-w-3xl'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-8'>
        <Link
          href='/admin/orders'
          className='text-muted-foreground hover:text-foreground transition-colors'
        >
          <span className='icon-[mingcute--arrow-left-line] size-5' />
        </Link>
        <div>
          <h1 className='text-xl font-bold tracking-tight'>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className='text-sm text-muted-foreground'>{date}</p>
        </div>
        <span
          className={`ml-auto text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className='flex flex-col gap-4'>
        {/* Status update */}
        <section className='rounded-lg border p-5'>
          <h2 className='text-sm font-semibold mb-4'>Update status</h2>
          <div className='flex gap-3 items-center'>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className='flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || selectedStatus === order.status}
              size='sm'
              className='bg-teal-600 hover:bg-teal-700'
            >
              {isUpdating ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </section>

        {/* Items */}
        <section className='rounded-lg border p-5'>
          <h2 className='text-sm font-semibold mb-4'>
            Items ({order.items.length})
          </h2>
          <div className='flex flex-col gap-4'>
            {order.items.map((item) => (
              <div key={item.id} className='flex gap-4 items-center'>
                <div className='relative size-14 shrink-0 rounded-lg bg-neutral-50 overflow-hidden'>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className='object-contain p-1.5'
                      sizes='56px'
                    />
                  ) : (
                    <div className='size-full flex items-center justify-center'>
                      <span className='icon-[mingcute--headphone-line] size-5 text-muted-foreground/20' />
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {item.productName}
                  </p>
                  <div className='flex items-center gap-1.5 mt-0.5'>
                    <span
                      className='size-3 rounded-full border border-border shrink-0'
                      style={{ backgroundColor: item.variantColorHex }}
                    />
                    <p className='text-xs text-muted-foreground'>
                      {item.variantColorName} · {item.variantSku}
                    </p>
                  </div>
                </div>
                <div className='text-right shrink-0'>
                  <p className='text-sm font-semibold'>
                    {((item.priceCents * item.quantity) / 100).toFixed(2)}{' '}
                    {order.currency}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    ×{item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className='border-t mt-4 pt-4 flex justify-between font-bold text-sm'>
            <span>Total</span>
            <span>
              {(order.totalCents / 100).toFixed(2)} {order.currency}
            </span>
          </div>
        </section>

        {/* Customer + shipping */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <section className='rounded-lg border p-5'>
            <h2 className='text-sm font-semibold mb-3'>Customer</h2>
            <p className='text-sm font-medium'>
              {order.firstName} {order.lastName}
            </p>
            <p className='text-sm text-muted-foreground'>{order.email}</p>
          </section>

          <section className='rounded-lg border p-5'>
            <h2 className='text-sm font-semibold mb-3'>Shipping address</h2>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {order.addressLine1}
              {order.addressLine2 && (
                <>
                  <br />
                  {order.addressLine2}
                </>
              )}
              <br />
              {order.postalCode} {order.city}
              <br />
              {order.country}
            </p>
          </section>
        </div>

        {/* Notes */}
        {order.notes && (
          <section className='rounded-lg border p-5'>
            <h2 className='text-sm font-semibold mb-2'>Notes</h2>
            <p className='text-sm text-muted-foreground'>{order.notes}</p>
          </section>
        )}
      </div>
    </div>
  );
}
