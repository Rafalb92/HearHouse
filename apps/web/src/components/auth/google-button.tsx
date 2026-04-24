'use client';

import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function GoogleButton({
  label = 'Continue with Google',
}: {
  label?: string;
}) {
  function handleClick() {
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <Button
      type='button'
      variant='outline'
      className='w-full flex items-center justify-center gap-2'
      onClick={handleClick}
    >
      <span
        className='icon-[mingcute--google-fill] size-4'
        aria-hidden='true'
      />
      <span>{label}</span>
    </Button>
  );
}
