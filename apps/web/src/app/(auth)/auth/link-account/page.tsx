'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { PasswordInput } from '@/components/shared/password-input';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';
import { useAuth } from '@/providers/auth-provider';
import { useState as useShowState } from 'react';

const schema = z.object({
  password: z.string().min(1, 'Password is required.'),
});

type Values = z.infer<typeof schema>;

export default function LinkAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email') ?? '';

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
    mode: 'onTouched',
  });

  if (!token) {
    return (
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Invalid link</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          This link is invalid or has expired.
        </p>
      </div>
    );
  }

  async function handleConfirm(data: Values) {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await authApi.confirmLink({
        linkToken: token,
        password: data.password,
      });
      signIn(res.user);
      toast.success('Accounts linked successfully!');
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstMessage);
        return;
      }
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>Link your account</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          An account with{' '}
          <span className='font-medium text-foreground'>{email}</span> already
          exists. Enter your password to link it with Google.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleConfirm)} noValidate>
        <FieldGroup>
          <Controller
            name='password'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='link-password'>Password</FieldLabel>
                <PasswordInput
                  {...field}
                  id='link-password'
                  placeholder='••••••••'
                  autoComplete='current-password'
                  show={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button type='submit' className='w-full mt-6' disabled={isLoading}>
          {isLoading ? 'Linking…' : 'Link accounts'}
        </Button>

        <Button
          type='button'
          variant='ghost'
          className='w-full mt-2'
          onClick={() => router.push('/sign-in')}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
}
