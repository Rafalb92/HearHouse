'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { customersApi, type Address } from '@/lib/api/customers.api';
import { ApiError } from '@/lib/errors/api-error';
import { Button } from '@/components/ui/button';
import {
  AddressForm,
  type AddressFormValues,
} from '@/components/customers/address-form';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; address: Address };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    customersApi
      .getAddresses()
      .then(setAddresses)
      .catch(() => toast.error('Failed to load addresses.'));
  }, []);

  async function handleCreate(data: AddressFormValues) {
    setIsLoading(true);
    try {
      const created = await customersApi.createAddress(data);
      setAddresses((prev) =>
        data.isDefault
          ? [created, ...prev.map((a) => ({ ...a, isDefault: false }))]
          : [...prev, created],
      );
      toast.success('Address added.');
      setMode({ type: 'list' });
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdate(address: Address, data: AddressFormValues) {
    setIsLoading(true);
    try {
      const updated = await customersApi.updateAddress(address.id, data);
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === updated.id) return updated;
          if (data.isDefault) return { ...a, isDefault: false };
          return a;
        }),
      );
      toast.success('Address updated.');
      setMode({ type: 'list' });
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await customersApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed.');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
      );
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await customersApi.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
      toast.success('Default address updated.');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.firstMessage : 'Something went wrong.',
      );
    }
  }

  // ─── Create form ─────────────────────────────────────────────────────────────

  if (mode.type === 'create') {
    return (
      <div className='max-w-lg mx-auto py-12 px-4'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold tracking-tight'>Add address</h1>
          <p className='mt-1.5 text-sm text-muted-foreground'>
            Add a new shipping address to your account.
          </p>
        </div>
        <AddressForm
          onSubmit={handleCreate}
          onCancel={() => setMode({ type: 'list' })}
          isLoading={isLoading}
          submitLabel='Add address'
        />
      </div>
    );
  }

  // ─── Edit form ───────────────────────────────────────────────────────────────

  if (mode.type === 'edit') {
    const { address } = mode;
    return (
      <div className='max-w-lg mx-auto py-12 px-4'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold tracking-tight'>Edit address</h1>
        </div>
        <AddressForm
          defaultValues={{
            label: address.label ?? '',
            firstName: address.firstName,
            lastName: address.lastName,
            phone: address.phone,
            street: address.street,
            apartment: address.apartment ?? '',
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault,
          }}
          onSubmit={(data) => handleUpdate(address, data)}
          onCancel={() => setMode({ type: 'list' })}
          isLoading={isLoading}
          submitLabel='Update address'
        />
      </div>
    );
  }

  // ─── List ─────────────────────────────────────────────────────────────────────

  return (
    <div className='max-w-lg mx-auto py-12 px-4'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Shipping addresses
          </h1>
          <p className='mt-1.5 text-sm text-muted-foreground'>
            Manage your saved addresses.
          </p>
        </div>
        <Button onClick={() => setMode({ type: 'create' })}>Add address</Button>
      </div>

      {addresses.length === 0 ? (
        <div className='flex flex-col items-center gap-4 py-16 text-center'>
          <span className='icon-[mingcute--location-line] size-10 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>
            No addresses saved yet.
          </p>
          <Button variant='outline' onClick={() => setMode({ type: 'create' })}>
            Add your first address
          </Button>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {addresses.map((address) => (
            <div
              key={address.id}
              className='rounded-lg border p-4 flex flex-col gap-3'
            >
              {/* Header */}
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  {address.label && (
                    <span className='text-xs font-medium bg-muted px-2 py-0.5 rounded-full'>
                      {address.label}
                    </span>
                  )}
                  {address.isDefault && (
                    <span className='text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 px-2 py-0.5 rounded-full'>
                      Default
                    </span>
                  )}
                </div>
                <div className='flex gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setMode({ type: 'edit', address })}
                  >
                    Edit
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-destructive hover:text-destructive'
                    onClick={() => handleDelete(address.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Address details */}
              <div className='text-sm text-foreground leading-relaxed'>
                <p className='font-medium'>
                  {address.firstName} {address.lastName}
                </p>
                <p>
                  {address.street}
                  {address.apartment ? `, ${address.apartment}` : ''}
                </p>
                <p>
                  {address.postalCode} {address.city}
                </p>
                <p>{address.country}</p>
                <p className='text-muted-foreground mt-1'>{address.phone}</p>
              </div>

              {/* Set default */}
              {!address.isDefault && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='self-start -ml-2 text-muted-foreground hover:text-foreground'
                  onClick={() => handleSetDefault(address.id)}
                >
                  Set as default
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
