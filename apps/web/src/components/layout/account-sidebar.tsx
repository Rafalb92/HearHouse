'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Profile',
    href: '/profile',
    icon: 'icon-[mingcute--user-3-line]',
  },
  {
    label: 'Address',
    href: '/addresses',
    icon: 'icon-[mingcute--location-line]',
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: 'icon-[mingcute--box-line]',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'icon-[mingcute--settings-3-line]',
  },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav>
      {/* Mobile — horizontal scrollable tabs */}
      <div className='flex gap-1 overflow-x-auto rounded-xl border bg-muted/40 p-1 lg:hidden'>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className={cn(item.icon, 'size-4')} aria-hidden='true' />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Desktop — vertical sidebar */}
      <div className='hidden lg:flex lg:flex-col lg:gap-1'>
        <p className='mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
          My Account
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  item.icon,
                  'size-4 shrink-0',
                  isActive ? 'text-teal-600' : '',
                )}
                aria-hidden='true'
              />
              {item.label}
              {isActive && (
                <span className='ml-auto size-1.5 rounded-full bg-teal-600' />
              )}
            </Link>
          );
        })}
      </div>
      <Link href='/' className='flex items-center'>
        <span className='icon-[mingcute--arrow-left-line] size-4'></span> Go
        back
      </Link>
    </nav>
  );
}
