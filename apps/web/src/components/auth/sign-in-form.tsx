'use client';

import { signInSchema, SignInValues } from '@/lib/schema/auth';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';
import { PasswordInput } from '../shared/password-input';
import { GoogleButton } from './google-button';

export function SignInForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: SignInValues) => void | Promise<void>;
  isLoading?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  return (
    <form id='auth-sign-in' onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className='gap-5'>
        {/* Email */}
        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='sign-in-email'>Email</FieldLabel>
              <Input
                {...field}
                id='sign-in-email'
                type='email'
                placeholder='you@example.com'
                autoComplete='email'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Password */}
        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className='flex items-center justify-between'>
                <FieldLabel htmlFor='sign-in-password'>Password</FieldLabel>
                <Link
                  href='/forgot-password'
                  className='text-xs text-muted-foreground underline-offset-4 hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                {...field}
                id='sign-in-password'
                placeholder='••••••••'
                autoComplete='current-password'
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type='submit'
        form='auth-sign-in'
        className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white'
        disabled={isLoading}
      >
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{' '}
        <Link
          href='/sign-up'
          className='font-medium text-foreground underline-offset-4 hover:underline'
        >
          Create one
        </Link>
      </p>
      <FieldSeparator className='my-4'>Or</FieldSeparator>
      <GoogleButton />
    </form>
  );
}
