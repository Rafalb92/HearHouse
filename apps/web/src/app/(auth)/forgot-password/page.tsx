'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';
import { ForgotPasswordValues } from '@/lib/schema/auth';
import { AuthForm } from '@/components/auth/auth-form';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleForgotPassword(data: ForgotPasswordValues) {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSent(true);
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

  if (sent) {
    return (
      <div>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Check your inbox
          </h1>
          <p className='mt-1.5 text-sm text-muted-foreground'>
            If an account exists for that email, we sent a reset link. It
            expires in 1 hour.
          </p>
        </div>
        <p className='text-sm text-muted-foreground text-center'>
          Didn&apos;t receive it?{' '}
          <button
            onClick={() => setSent(false)}
            className='font-medium text-foreground underline-offset-4 hover:underline'
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>Forgot password?</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          No worries — we&apos;ll send you a reset link.
        </p>
      </div>
      <AuthForm
        mode='forgot-password'
        onSubmit={handleForgotPassword}
        isLoading={isLoading}
      />
    </div>
  );
}
