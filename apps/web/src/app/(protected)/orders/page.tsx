'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi, type Order } from '@/lib/api/orders.api';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Paid', color: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Delivered', color: 'bg-teal-100 text-teal-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? {
    label: status,
    color: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .list()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className='max-w-3xl mx-auto px-4 py-12'>
        <div className='h-8 w-48 bg-muted animate-pulse rounded mb-8' />
        <div className='flex flex-col gap-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-24 bg-muted animate-pulse rounded-xl' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto px-4 py-12'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>My Orders</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          {orders.length === 0
            ? 'No orders yet.'
            : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 gap-4'>
          <span className='icon-[mingcute--basket-line] size-16 text-muted-foreground/30' />
          <p className='text-muted-foreground'>
            You haven't placed any orders yet.
          </p>
          <Button asChild variant='outline'>
            <Link href='/products'>Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {orders.map((order) => {
            const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const total = (order.totalCents / 100).toFixed(2);

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className='rounded-xl border p-5 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4'
              >
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <p className='text-sm font-medium'>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {date} · {order.items?.length ?? 0}{' '}
                    {(order.items?.length ?? 0) === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className='text-right shrink-0'>
                  <p className='font-semibold'>
                    {total} {order.currency}
                  </p>
                  <span className='icon-[mingcute--right-line] size-4 text-muted-foreground' />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
