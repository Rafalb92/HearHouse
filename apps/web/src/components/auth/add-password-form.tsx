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
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Include at least one uppercase letter.')
      .regex(/[0-9]/, 'Include at least one number.'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

type Props = {
  onSubmit: (password: string) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
};

export function AddPasswordForm({ onSubmit, onCancel, isLoading }: Props) {
  const [show, setShow] = useState({ password: false, confirm: false });
  const toggle = (key: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  return (
    <form onSubmit={form.handleSubmit((d) => onSubmit(d.password))} noValidate>
      <FieldGroup className='gap-5'>
        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='add-password'>Password</FieldLabel>
              <PasswordInput
                {...field}
                id='add-password'
                placeholder='••••••••'
                autoComplete='new-password'
                show={show.password}
                onToggle={() => toggle('password')}
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
              <FieldLabel htmlFor='add-confirm'>Confirm password</FieldLabel>
              <PasswordInput
                {...field}
                id='add-confirm'
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

      <div className='flex gap-3 mt-6'>
        <Button type='submit' className='flex-1' disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save password'}
        </Button>
        {onCancel && (
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
