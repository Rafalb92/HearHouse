'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';
import { useState } from 'react';
import { SignInValues } from '@/lib/schema/auth';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/providers/auth-provider';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn(data: SignInValues) {
    setIsLoading(true);
    try {
      const res = await authApi.login(data);
      signIn(res.user); // ← to było pominięte
      toast.success(
        `Welcome back${res.user.displayName ? `, ${res.user.displayName}` : ''}!`,
      );
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          toast.error('Invalid email or password.');
          return;
        }
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
        <h1 className='text-2xl font-bold tracking-tight'>Welcome back</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Sign in to your HearHouse account.
        </p>
      </div>
      <AuthForm mode='sign-in' onSubmit={handleSignIn} isLoading={isLoading} />
    </div>
  );
}
