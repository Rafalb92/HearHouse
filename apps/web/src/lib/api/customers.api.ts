// Dodaj do lib/api/customers.api.ts

import { apiClient } from '@/lib/api/client';

export type CustomerProfile = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  updatedAt: string;
};

export type Address = {
  id: string;
  userId: string;
  isDefault: boolean;
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  apartment: string | null;
  city: string;
  postalCode: string;
  country: string;
  createdAt: string;
};

export type UpsertAddressInput = {
  label?: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
};

export const customersApi = {
  // ─── Profile ───────────────────────────────────────────────────────────────

  getProfile(): Promise<CustomerProfile> {
    return apiClient<CustomerProfile>('/customers/profile');
  },

  updateProfile(data: UpdateProfileInput): Promise<CustomerProfile> {
    return apiClient<CustomerProfile>('/customers/profile', {
      method: 'PATCH',
      body: data,
    });
  },

  // ─── Addresses ─────────────────────────────────────────────────────────────

  getAddresses(): Promise<Address[]> {
    return apiClient<Address[]>('/customers/addresses');
  },

  getAddress(id: string): Promise<Address> {
    return apiClient<Address>(`/customers/addresses/${id}`);
  },

  createAddress(data: UpsertAddressInput): Promise<Address> {
    return apiClient<Address>('/customers/addresses', {
      method: 'POST',
      body: data,
    });
  },

  updateAddress(id: string, data: UpsertAddressInput): Promise<Address> {
    return apiClient<Address>(`/customers/addresses/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  deleteAddress(id: string): Promise<void> {
    return apiClient<void>(`/customers/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  setDefaultAddress(id: string): Promise<Address> {
    return apiClient<Address>(`/customers/addresses/${id}/default`, {
      method: 'PATCH',
    });
  },
};
