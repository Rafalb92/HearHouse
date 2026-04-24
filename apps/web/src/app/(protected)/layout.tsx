import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AccountSidebar } from '@/components/layout/account-sidebar';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.has(
    process.env.COOKIE_ACCESS_NAME ?? 'access_token',
  );

  if (!hasAccess) {
    redirect('/sign-in');
  }

  return (
    <div className='min-h-screen'>
      <div className='mx-auto max-w-6xl px-4 py-8 lg:py-12'>
        <div className='flex flex-col gap-8 lg:flex-row lg:gap-12'>
          {/* Sidebar */}
          <aside className='w-full lg:w-56 shrink-0'>
            <AccountSidebar />
          </aside>

          {/* Main content */}
          <main className='min-w-0 flex-1'>{children}</main>
        </div>
      </div>
    </div>
  );
}
