import { apiClient } from './client';

// ─── Response types ────────────────────────────────────────────────────────

export type SafeUser = {
  id: string;
  email: string;
  roles: string[];
  status: string;
  displayName: string | null;
};

type AuthResponse = { user: SafeUser };

// ─── Endpoints ─────────────────────────────────────────────────────────────

export const authApi = {
  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<SafeUser> {
    return apiClient<SafeUser>('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  login(data: { email: string; password: string }): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: data,
    });
  },

  logout(): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },

  session(): Promise<{ user: SafeUser | null }> {
    return apiClient<{ user: SafeUser | null }>('/auth/session');
  },
  forgotPassword(data: { email: string }): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: data,
    });
  },

  resetPassword(data: {
    token: string;
    password: string;
  }): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: data,
    });
  },

  verifyEmail(data: { token: string }): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/auth/verify-email', {
      method: 'POST',
      body: data,
    });
  },

  resendVerification(): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/auth/resend-verification', {
      method: 'POST',
    });
  },

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/auth/change-password', {
      method: 'POST',
      body: data,
    });
  },
  confirmLink(data: {
    linkToken: string;
    password: string;
  }): Promise<{ user: SafeUser }> {
    return apiClient<{ user: SafeUser }>('/auth/link/confirm', {
      method: 'POST',
      body: data,
    });
  },

  addPassword(data: { password: string }): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>('/auth/add-password', {
      method: 'POST',
      body: data,
    });
  },

  linkedAccounts(): Promise<
    {
      provider: string;
      providerType: string;
      createdAt: string;
    }[]
  > {
    return apiClient('/auth/linked-accounts');
  },

  unlinkProvider(provider: string): Promise<{ ok: boolean }> {
    return apiClient<{ ok: boolean }>(`/auth/unlink/${provider}`, {
      method: 'DELETE',
    });
  },
  refresh(): Promise<{ user: SafeUser }> {
    return apiClient<{ user: SafeUser }>('/auth/refresh', { method: 'POST' });
  },
};
