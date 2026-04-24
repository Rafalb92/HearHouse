'use client';

import { forgotPasswordSchema, ForgotPasswordValues } from '@/lib/schema/auth';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/dist/client/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

export function ForgotPasswordForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: ForgotPasswordValues) => void | Promise<void>;
  isLoading?: boolean;
}) {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  return (
    <form id='auth-forgot' onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='forgot-email'>Email</FieldLabel>
              <Input
                {...field}
                id='forgot-email'
                type='email'
                placeholder='you@example.com'
                autoComplete='email'
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                We&apos;ll send a password reset link to this address.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type='submit'
        form='auth-forgot'
        className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white'
        disabled={isLoading}
      >
        {isLoading ? 'Sending…' : 'Send reset link'}
      </Button>

      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Back to{' '}
        <Link
          href='/sign-in'
          className='font-medium text-foreground underline-offset-4 hover:underline'
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
