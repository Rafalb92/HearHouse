'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import type { Address } from '@/lib/api/customers.api';

const schema = z.object({
  label: z.string().max(50).optional(),
  firstName: z.string().min(1, 'Required.').max(100),
  lastName: z.string().min(1, 'Required.').max(100),
  phone: z
    .string()
    .min(1, 'Required.')
    .regex(/^\+?[\d\s\-().]{7,30}$/, 'Invalid phone number.'),
  street: z.string().min(1, 'Required.').max(255),
  apartment: z.string().max(100).optional(),
  city: z.string().min(1, 'Required.').max(100),
  postalCode: z.string().min(1, 'Required.').max(20),
  country: z.string().length(2, 'Use 2-letter country code (e.g. PL, DE, GB).'),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (data: AddressFormValues) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function AddressForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = 'Save address',
}: Props) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      firstName: '',
      lastName: '',
      phone: '',
      street: '',
      apartment: '',
      city: '',
      postalCode: '',
      country: 'PL',
      isDefault: false,
      ...defaultValues,
    },
    mode: 'onTouched',
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className='gap-4'>
        {/* Label */}
        <Controller
          name='label'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='addr-label'>
                Label{' '}
                <span className='text-muted-foreground font-normal'>
                  (optional)
                </span>
              </FieldLabel>
              <Input
                {...field}
                id='addr-label'
                placeholder='Home, Work…'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* First + Last name */}
        <div className='grid grid-cols-2 gap-4'>
          <Controller
            name='firstName'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='addr-first-name'>First name</FieldLabel>
                <Input
                  {...field}
                  id='addr-first-name'
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
                <FieldLabel htmlFor='addr-last-name'>Last name</FieldLabel>
                <Input
                  {...field}
                  id='addr-last-name'
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

        {/* Phone */}
        <Controller
          name='phone'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='addr-phone'>Phone number</FieldLabel>
              <Input
                {...field}
                id='addr-phone'
                type='tel'
                placeholder='+48 123 456 789'
                autoComplete='tel'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Street */}
        <Controller
          name='street'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='addr-street'>Street address</FieldLabel>
              <Input
                {...field}
                id='addr-street'
                placeholder='ul. Przykładowa 12'
                autoComplete='address-line1'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Apartment */}
        <Controller
          name='apartment'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='addr-apartment'>
                Apartment / Suite{' '}
                <span className='text-muted-foreground font-normal'>
                  (optional)
                </span>
              </FieldLabel>
              <Input
                {...field}
                id='addr-apartment'
                placeholder='Apt 4B'
                autoComplete='address-line2'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* City + Postal code */}
        <div className='grid grid-cols-2 gap-4'>
          <Controller
            name='city'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='addr-city'>City</FieldLabel>
                <Input
                  {...field}
                  id='addr-city'
                  placeholder='Warsaw'
                  autoComplete='address-level2'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='postalCode'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='addr-postal'>Postal code</FieldLabel>
                <Input
                  {...field}
                  id='addr-postal'
                  placeholder='00-001'
                  autoComplete='postal-code'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Country */}
        <Controller
          name='country'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='addr-country'>Country</FieldLabel>
              <Input
                {...field}
                id='addr-country'
                placeholder='PL'
                maxLength={2}
                autoComplete='country'
                aria-invalid={fieldState.invalid}
                className='uppercase'
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Default checkbox */}
        <Controller
          name='isDefault'
          control={form.control}
          render={({ field }) => (
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={field.value ?? false}
                onChange={field.onChange}
                className='rounded border-input size-4'
              />
              <span className='text-sm'>Set as default address</span>
            </label>
          )}
        />
      </FieldGroup>

      <div className='flex gap-3 mt-6'>
        <Button type='submit' className='flex-1' disabled={isLoading}>
          {isLoading ? 'Saving…' : submitLabel}
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
