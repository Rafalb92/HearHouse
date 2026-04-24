'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const token = searchParams.get('token');

  // Brak tokenu w URL → przekieruj
  if (!token) {
    return (
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Invalid link</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          This password reset link is invalid or has expired.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Password updated!</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Your password has been changed. You can now sign in.
        </p>
        <button
          onClick={() => router.push('/auth/sign-in')}
          className='mt-6 w-full'
        >
          Go to sign in
        </button>
      </div>
    );
  }

  async function handleReset(password: string) {
    if (!token) return;
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
      toast.success('Password updated successfully.');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstMessage);
        return;
      }
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>Set new password</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Choose a strong password for your account.
        </p>
      </div>
      <ResetPasswordForm onSubmit={handleReset} isLoading={isLoading} />
    </div>
  );
}
