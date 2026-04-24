'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';
import { useState } from 'react';
import { SignUpValues } from '@/lib/schema/auth';
import { AuthForm } from '@/components/auth/auth-form';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignUp(data: SignUpValues) {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      toast.success('Account created! Please sign in.');
      router.push('/sign-in');
    } catch (err) {
      if (err instanceof ApiError) {
        // 400 → email już zajęty lub błędy walidacji z Nest
        if (err.status === 400) {
          // Nest class-validator zwraca tablicę message
          err.messages.forEach((msg) => toast.error(msg));
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
        <h1 className='text-2xl font-bold tracking-tight'>
          Create your account
        </h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Join HearHouse and discover music your way.
        </p>
      </div>
      <AuthForm mode='sign-up' onSubmit={handleSignUp} isLoading={isLoading} />
    </div>
  );
}
