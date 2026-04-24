'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { Order, OrderStatus } from '@/lib/api/orders.api';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Paid', color: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Delivered', color: 'bg-teal-100 text-teal-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_LABELS[status];
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient<Order[]>('/admin/orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='h-16 bg-muted animate-pulse rounded-lg' />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-xl font-bold tracking-tight'>Orders</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          {orders.length} total
        </p>
      </div>

      {orders.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No orders yet.</p>
      ) : (
        <div className='rounded-lg border overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='text-left px-4 py-3 font-medium text-muted-foreground'>
                  Order
                </th>
                <th className='text-left px-4 py-3 font-medium text-muted-foreground'>
                  Customer
                </th>
                <th className='text-left px-4 py-3 font-medium text-muted-foreground'>
                  Date
                </th>
                <th className='text-left px-4 py-3 font-medium text-muted-foreground'>
                  Status
                </th>
                <th className='text-right px-4 py-3 font-medium text-muted-foreground'>
                  Total
                </th>
                <th className='px-4 py-3' />
              </tr>
            </thead>
            <tbody className='divide-y'>
              {orders.map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString(
                  'en-GB',
                  { year: 'numeric', month: 'short', day: 'numeric' },
                );
                return (
                  <tr
                    key={order.id}
                    className='hover:bg-muted/30 transition-colors'
                  >
                    <td className='px-4 py-3 font-mono text-xs'>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className='px-4 py-3'>
                      <p className='font-medium'>
                        {order.firstName} {order.lastName}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {order.email}
                      </p>
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>{date}</td>
                    <td className='px-4 py-3'>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className='px-4 py-3 text-right font-semibold'>
                      {(order.totalCents / 100).toFixed(2)} {order.currency}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className='text-xs text-teal-600 hover:underline font-medium'
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
