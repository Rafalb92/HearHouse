'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi, type SafeUser } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: SafeUser }
  | { status: 'unauthenticated' };

type AuthContext = {
  state: AuthState;
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (user: SafeUser) => void;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  const fetchSession = useCallback(async () => {
    try {
      const res = await authApi.session();
      if (res.user) {
        setState({ status: 'authenticated', user: res.user });
      } else {
        try {
          await authApi.refresh();
          const retried = await authApi.session();
          if (retried.user) {
            setState({ status: 'authenticated', user: retried.user });
          } else {
            setState({ status: 'unauthenticated' });
          }
        } catch {
          // 401 przy refresh gdy niezalogowany — normalne, cicho ignoruj
          setState({ status: 'unauthenticated' });
        }
      }
    } catch {
      setState({ status: 'unauthenticated' });
    }
  }, []);

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setState({ status: 'unauthenticated' });
      router.push('/sign-in');
      router.refresh();
    }
  }, [router]);

  const signIn = useCallback((user: SafeUser) => {
    setState({ status: 'authenticated', user });
  }, []);

  const value: AuthContext = {
    state,
    user: state.status === 'authenticated' ? state.user : null,
    isAuthenticated: state.status === 'authenticated',
    isLoading: state.status === 'loading',
    signIn,
    signOut,
    refresh: fetchSession,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
