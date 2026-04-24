'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { ordersApi, type Order } from '@/lib/api/orders.api';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700',
    icon: 'icon-[mingcute--time-line]',
  },
  PAID: {
    label: 'Paid',
    color: 'bg-blue-100 text-blue-700',
    icon: 'icon-[mingcute--check-line]',
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-700',
    icon: 'icon-[mingcute--truck-line]',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-teal-100 text-teal-700',
    icon: 'icon-[mingcute--check-2-line]',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    icon: 'icon-[mingcute--close-line]',
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? {
    label: status,
    color: 'bg-muted text-muted-foreground',
    icon: '',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${s.color}`}
    >
      <span className={`${s.icon} size-4`} />
      {s.label}
    </span>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === '1';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .get(params.id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className='max-w-3xl mx-auto px-4 py-12'>
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-24 bg-muted animate-pulse rounded-xl' />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='max-w-3xl mx-auto px-4 py-24 text-center'>
        <p className='text-muted-foreground'>Order not found.</p>
        <Button asChild variant='outline' className='mt-4'>
          <Link href='/orders'>Back to orders</Link>
        </Button>
      </div>
    );
  }

  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const total = (order.totalCents / 100).toFixed(2);

  return (
    <div className='max-w-3xl mx-auto px-4 py-12'>
      {/* Header */}
      {isNew && (
        <div className='rounded-xl bg-teal-50 border border-teal-200 p-4 mb-8 flex items-center gap-3'>
          <span className='icon-[mingcute--check-2-line] size-5 text-teal-600 shrink-0' />
          <div>
            <p className='text-sm font-semibold text-teal-800'>
              Order placed successfully!
            </p>
            <p className='text-xs text-teal-600'>
              A confirmation email has been sent to {order.email}.
            </p>
          </div>
        </div>
      )}

      <div className='flex items-start justify-between mb-8 gap-4'>
        <div>
          <p className='text-sm text-muted-foreground mb-1'>
            Order #{order.id.slice(0, 8).toUpperCase()} · {date}
          </p>
          <h1 className='text-2xl font-bold tracking-tight'>Order details</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <section className='rounded-xl border p-6 mb-4'>
        <h2 className='text-sm font-semibold mb-4'>Items</h2>
        <div className='flex flex-col gap-4'>
          {order.items.map((item) => (
            <div key={item.id} className='flex gap-4'>
              <div className='relative size-16 shrink-0 rounded-lg bg-neutral-50 overflow-hidden'>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className='object-contain p-2'
                    sizes='64px'
                  />
                ) : (
                  <div className='size-full flex items-center justify-center'>
                    <span className='icon-[mingcute--headphone-line] size-6 text-muted-foreground/20' />
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>
                  {item.productName}
                </p>
                <div className='flex items-center gap-1.5 mt-0.5'>
                  <span
                    className='size-3 rounded-full border border-border'
                    style={{ backgroundColor: item.variantColorHex }}
                  />
                  <p className='text-xs text-muted-foreground'>
                    {item.variantColorName} · {item.variantSku}
                  </p>
                </div>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  ×{item.quantity}
                </p>
              </div>
              <p className='text-sm font-semibold shrink-0'>
                {((item.priceCents * item.quantity) / 100).toFixed(2)}{' '}
                {order.currency}
              </p>
            </div>
          ))}
        </div>

        <div className='border-t mt-4 pt-4 flex justify-between font-bold'>
          <span>Total</span>
          <span>
            {total} {order.currency}
          </span>
        </div>
      </section>

      {/* Shipping */}
      <section className='rounded-xl border p-6 mb-8'>
        <h2 className='text-sm font-semibold mb-3'>Shipping address</h2>
        <p className='text-sm text-muted-foreground leading-relaxed'>
          {order.firstName} {order.lastName}
          <br />
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

      <Button asChild variant='outline'>
        <Link href='/orders'>← Back to orders</Link>
      </Button>
    </div>
  );
}
