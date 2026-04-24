'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { AddPasswordForm } from '@/components/auth/add-password-form';

type LinkedAccount = {
  provider: string;
  providerType: string;
  createdAt: string;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [showAddPassword, setShowAddPassword] = useState(false);

  useEffect(() => {
    authApi
      .linkedAccounts()
      .then(setAccounts)
      .catch(() => toast.error('Failed to load linked accounts.'));
  }, []);

  const hasCredentials = accounts.some((a) => a.provider === 'credentials');
  const hasGoogle = accounts.some((a) => a.provider === 'google');

  async function handleUnlink(provider: string) {
    try {
      await authApi.unlinkProvider(provider);
      setAccounts((prev) => prev.filter((a) => a.provider !== provider));
      toast.success(`${provider} unlinked.`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstMessage);
        return;
      }
      toast.error('Something went wrong.');
    }
  }

  async function handleAddPassword(password: string) {
    try {
      await authApi.addPassword({ password });
      toast.success('Password added successfully.');
      setShowAddPassword(false);
      const updated = await authApi.linkedAccounts();
      setAccounts(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstMessage);
        return;
      }
      toast.error('Something went wrong.');
    }
  }

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  return (
    <div className='max-w-md mx-auto py-12 px-4'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Signed in as{' '}
          <span className='font-medium text-foreground'>
            {user?.displayName ?? user?.email}
          </span>
        </p>
      </div>

      {/* Linked accounts */}
      <section className='mb-8'>
        <h2 className='text-base font-semibold mb-4'>Sign-in methods</h2>

        <div className='flex flex-col gap-3'>
          {/* Credentials */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-3'>
              <span className='icon-[mingcute--safe-lock-line] size-5' />
              <div>
                <p className='text-sm font-medium'>Email & password</p>
                {!hasCredentials && (
                  <p className='text-xs text-muted-foreground'>Not set up</p>
                )}
              </div>
            </div>
            {hasCredentials ? (
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive'
                onClick={() => handleUnlink('credentials')}
                disabled={accounts.length <= 1}
              >
                Remove
              </Button>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowAddPassword(true)}
              >
                Add password
              </Button>
            )}
          </div>

          {/* Google */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-3'>
              <span className='icon-[logos--google-icon] size-5' />
              <div>
                <p className='text-sm font-medium'>Google</p>
                {!hasGoogle && (
                  <p className='text-xs text-muted-foreground'>Not connected</p>
                )}
              </div>
            </div>
            {hasGoogle ? (
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive'
                onClick={() => handleUnlink('google')}
                disabled={accounts.length <= 1}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  window.location.href = `${BACKEND_URL}/auth/google`;
                }}
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Add password form */}
      {showAddPassword && !hasCredentials && (
        <section>
          <h2 className='text-base font-semibold mb-4'>Add password</h2>
          <AddPasswordForm
            onSubmit={handleAddPassword}
            onCancel={() => setShowAddPassword(false)}
          />
        </section>
      )}
    </div>
  );
}
