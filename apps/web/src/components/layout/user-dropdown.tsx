'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const authenticatedItems: { group: string; items: NavItem[] }[] = [
  {
    group: 'Account',
    items: [
      {
        label: 'Profile',
        href: '/profile',
        icon: 'icon-[mingcute--profile-line]',
      },
      {
        label: 'Address',
        href: '/addresses',
        icon: 'icon-[mingcute--map-pin-line]',
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: 'icon-[mingcute--settings-3-line]',
      },
      {
        label: 'Payments',
        href: '/settings/payments',
        icon: 'icon-[mingcute--bank-card-line]',
      },
      {
        label: 'Wishlist',
        href: '/wishlist',
        icon: 'icon-[mingcute--heart-line]',
      },

      {
        label: 'Orders',
        href: '/orders',
        icon: 'icon-[mingcute--basket-line]',
      },
    ],
  },
];

const adminItems: NavItem[] = [
  {
    label: 'Admin panel',
    href: '/admin/products',
    icon: 'icon-[mingcute--settings-6-line]',
  },
];

const guestItems: NavItem[] = [
  {
    label: 'Sign in',
    href: '/sign-in',
    icon: 'icon-[mingcute--safe-lock-line]',
  },
  {
    label: 'Create account',
    href: '/sign-up',
    icon: 'icon-[mingcute--user-add-line]',
  },
  {
    label: 'Forgot password',
    href: '/forgot-password',
    icon: 'icon-[mingcute--key-2-line]',
  },
];

function MenuItem({ item }: { item: NavItem }) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href={item.href}
        className='flex items-center gap-2.5 cursor-pointer'
      >
        <span className={cn('size-4 shrink-0', item.icon)} aria-hidden='true' />
        {item.label}
      </Link>
    </DropdownMenuItem>
  );
}

export function UserDropdown() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();

  // Podczas ładowania sesji — skeleton żeby nie było skoku layoutu
  if (isLoading) {
    return <Skeleton className='size-10 rounded-full' />;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label='User menu'
          type='button'
          className='rounded-full size-10 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-accent'
        >
          <span
            className={cn('size-6', 'icon-[mingcute--user-2-line]')}
            aria-hidden='true'
          />
          <span className='sr-only'>User menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' sideOffset={8} className='w-52'>
        {isAuthenticated ? (
          <>
            {user && (
              <>
                <DropdownMenuLabel className='font-normal'>
                  <span className='block text-xs text-muted-foreground'>
                    Signed in as
                  </span>
                  <span className='block truncate font-medium'>
                    {user.displayName ?? user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}

            {authenticatedItems.map(({ group, items }) => (
              <DropdownMenuGroup key={group}>
                <DropdownMenuLabel className='text-xs text-muted-foreground font-normal'>
                  {group}
                </DropdownMenuLabel>
                {items.map((item) => (
                  <MenuItem key={item.href} item={item} />
                ))}
              </DropdownMenuGroup>
            ))}

            {(user?.roles.includes('ADMIN') ||
              user?.roles.includes('SUPER_ADMIN')) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='text-xs text-muted-foreground font-normal'>
                    Administration
                  </DropdownMenuLabel>
                  {adminItems.map((item) => (
                    <MenuItem key={item.href} item={item} />
                  ))}
                </DropdownMenuGroup>
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => void signOut()}
              className='flex items-center gap-2.5 text-destructive focus:text-destructive cursor-pointer'
            >
              <span
                className='icon-[mingcute--logout-2-line] size-4 shrink-0'
                aria-hidden='true'
              />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className='text-xs text-muted-foreground font-normal'>
              My account
            </DropdownMenuLabel>
            {guestItems.map((item) => (
              <MenuItem key={item.href} item={item} />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
