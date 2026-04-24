'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  {
    label: 'Products',
    href: '/admin/products',
    icon: 'icon-[mingcute--box-line]',
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: 'icon-[mingcute--list-check-line]',
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: 'icon-[mingcute--group-line]',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className='w-56 shrink-0 border-r bg-muted/30 flex flex-col min-h-screen'>
      {/* Logo */}
      <div className='h-14 flex items-center px-5 border-b'>
        <span className='font-semibold text-sm tracking-tight'>
          HearHouse{' '}
          <span className='text-muted-foreground font-normal'>Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className='flex-1 p-3 flex flex-col gap-1'>
        <p className='px-2 mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
          Manage
        </p>
        {NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  item.icon,
                  'size-4 shrink-0',
                  isActive ? 'text-teal-600' : '',
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to store */}
      <div className='p-3 border-t'>
        <Link
          href='/'
          className='flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <span className='icon-[mingcute--arrow-left-line] size-4' />
          Back to store
        </Link>
      </div>
    </aside>
  );
}
