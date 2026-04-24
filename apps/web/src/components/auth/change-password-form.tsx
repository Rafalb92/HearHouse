'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { PasswordInput } from '@/components/shared/password-input';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Include at least one uppercase letter.')
      .regex(/[0-9]/, 'Include at least one number.'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
  });

export type ChangePasswordValues = z.infer<typeof schema>;

type Props = {
  onSubmit: (data: ChangePasswordValues) => void | Promise<void>;
  isLoading?: boolean;
};

export function ChangePasswordForm({ onSubmit, isLoading }: Props) {
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const toggle = (key: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  return (
    <form
      id='change-password-form'
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FieldGroup className='gap-5'>
        <Controller
          name='currentPassword'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='current-password'>
                Current password
              </FieldLabel>
              <PasswordInput
                {...field}
                id='current-password'
                placeholder='••••••••'
                autoComplete='current-password'
                show={show.current}
                onToggle={() => toggle('current')}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name='newPassword'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='new-password'>New password</FieldLabel>
              <PasswordInput
                {...field}
                id='new-password'
                placeholder='••••••••'
                autoComplete='new-password'
                show={show.new}
                onToggle={() => toggle('new')}
                invalid={fieldState.invalid}
              />
              <FieldDescription>
                Min. 8 characters, one uppercase, one number.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name='confirmPassword'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='confirm-password'>
                Confirm new password
              </FieldLabel>
              <PasswordInput
                {...field}
                id='confirm-password'
                placeholder='••••••••'
                autoComplete='new-password'
                show={show.confirm}
                onToggle={() => toggle('confirm')}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type='submit'
        form='change-password-form'
        className='w-full mt-6'
        disabled={isLoading}
      >
        {isLoading ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}
