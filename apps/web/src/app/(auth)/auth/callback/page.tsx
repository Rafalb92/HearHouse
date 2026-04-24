'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  useEffect(() => {
    authApi.session().then((res) => {
      if (!res.user) {
        router.push('/sign-in');
        return;
      }
      signIn(res.user);
      toast.success(
        `Welcome${res.user.displayName ? `, ${res.user.displayName}` : ''}!`,
      );
      router.push('/');
    });
  }, [router, signIn]);

  return (
    <div>
      <h1 className='text-2xl font-bold tracking-tight'>Signing you in…</h1>
      <p className='mt-1.5 text-sm text-muted-foreground'>
        Please wait a moment.
      </p>
    </div>
  );
}
