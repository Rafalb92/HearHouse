'use client';

import { signUpSchema, SignUpValues } from '@/lib/schema/auth';
import {
  Field,
  FieldDescription,
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
import { PasswordInput } from '@/components/shared/password-input';
import { GoogleButton } from './google-button';

export function SignUpForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: SignUpValues) => void | Promise<void>;
  isLoading?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },

    mode: 'onTouched',
  });

  return (
    <form id='auth-sign-up' onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className='gap-5'>
        {/* Name */}
        <div className='grid grid-cols-2 gap-4'>
          <Controller
            name='firstName'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='sign-up-first-name'>First name</FieldLabel>
                <Input
                  {...field}
                  id='sign-up-first-name'
                  type='text'
                  placeholder='John'
                  autoComplete='given-name'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='lastName'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='sign-up-last-name'>Last name</FieldLabel>
                <Input
                  {...field}
                  id='sign-up-last-name'
                  type='text'
                  placeholder='Doe'
                  autoComplete='family-name'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Email */}
        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='sign-up-email'>Email</FieldLabel>
              <Input
                {...field}
                id='sign-up-email'
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
              <FieldLabel htmlFor='sign-up-password'>Password</FieldLabel>
              <PasswordInput
                {...field}
                id='sign-up-password'
                placeholder='••••••••'
                autoComplete='new-password'
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                invalid={fieldState.invalid}
              />
              <FieldDescription>
                Min. 8 characters, one uppercase, one number.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Confirm password */}
        <Controller
          name='confirmPassword'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='sign-up-confirm'>
                Confirm password
              </FieldLabel>
              <PasswordInput
                {...field}
                id='sign-up-confirm'
                placeholder='••••••••'
                autoComplete='new-password'
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type='submit'
        form='auth-sign-up'
        className='w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white'
        disabled={isLoading}
      >
        {isLoading ? 'Creating account…' : 'Create account'}
      </Button>

      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link
          href='/sign-in'
          className='font-medium text-foreground underline-offset-4 hover:underline'
        >
          Sign in
        </Link>
      </p>
      <FieldSeparator className='my-4'>Or</FieldSeparator>
      <GoogleButton />
    </form>
  );
}
