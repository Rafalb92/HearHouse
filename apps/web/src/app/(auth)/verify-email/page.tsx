'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';
import { Button } from '@/components/ui/button';

type State = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMsg('Invalid verification link.');
      return;
    }

    authApi
      .verifyEmail({ token })
      .then(() => setState('success'))
      .catch((err) => {
        setState('error');
        setErrorMsg(
          err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
        );
      });
  }, [token]);

  if (state === 'loading') {
    return (
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Verifying…</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Please wait while we verify your email.
        </p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Email verified!</h1>
          <p className='mt-1.5 text-sm text-muted-foreground'>
            Your account is now active. You can sign in.
          </p>
        </div>
        <Button onClick={() => router.push('/sign-in')}>Sign in</Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          Verification failed
        </h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>{errorMsg}</p>
      </div>
      <Button variant='outline' onClick={() => router.push('/sign-in')}>
        Back to sign in
      </Button>
    </div>
  );
}
