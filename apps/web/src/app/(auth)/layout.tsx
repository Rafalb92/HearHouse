import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NoContextMenu } from '@/components/shared/no-context-menu';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='w-full mx-auto max-w-7xl h-svh grid lg:grid-cols-2 overflow-hidden'>
      {/* ── lewa kolumna: formularz ── */}
      <div className='flex flex-col px-6 py-10 sm:px-10 lg:px-16'>
        <div className='flex items-center justify-between mb-10'>
          <Link href='/' className='font-semibold text-lg tracking-tight'>
            HearHouse
          </Link>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/'>
              <span className='icon-[mingcute--arrow-left-line] size-4 mr-1.5' />
              Back to home
            </Link>
          </Button>
        </div>

        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-sm'>{children}</div>
        </div>
      </div>

      {/* ── prawa kolumna: video ── */}
      <div className='min-h-full relative hidden lg:flex items-center justify-center rounded-2xl py-4'>
        <div className='relative w-full rounded-2xl h-full overflow-hidden'>
          <video
            autoPlay
            loop
            muted
            playsInline
            className='w-full h-dvh object-cover'
          >
            <source src='/auth-video.mp4' type='video/mp4' />
          </video>
          <NoContextMenu className='absolute inset-0 z-10' />
        </div>
      </div>
    </div>
  );
}
