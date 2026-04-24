import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

async function getSession() {
  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
      headers: { Cookie: cookieStore.toString() },
      cache: 'no-store',
    });
    return res.json();
  } catch {
    return { user: null };
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user) redirect('/sign-in');
  if (!user.roles.includes('ADMIN') && !user.roles.includes('SUPER_ADMIN')) {
    redirect('/');
  }

  return (
    <div className='min-h-screen flex'>
      <AdminSidebar />
      <div className='flex-1 flex flex-col min-w-0'>
        <main className='flex-1 p-6 lg:p-8'>{children}</main>
      </div>
    </div>
  );
}
