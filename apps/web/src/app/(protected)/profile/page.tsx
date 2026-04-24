'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { customersApi, type CustomerProfile } from '@/lib/api/customers.api';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/errors/api-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  ChangePasswordForm,
  type ChangePasswordValues,
} from '@/components/auth/change-password-form';

const profileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,30}$/, 'Invalid phone number.')
    .optional()
    .or(z.literal('')),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', phone: '' },
  });

  useEffect(() => {
    Promise.all([customersApi.getProfile(), authApi.linkedAccounts()])
      .then(([prof, accounts]) => {
        setProfile(prof);
        setHasPassword(accounts.some((a) => a.provider === 'credentials'));
        form.reset({
          firstName: prof.firstName ?? '',
          lastName: prof.lastName ?? '',
          phone: prof.phone ?? '',
        });
      })
      .catch(() => toast.error('Failed to load profile.'));
  }, [form]);

  async function handleSaveProfile(data: ProfileValues) {
    setIsSavingProfile(true);
    try {
      const updated = await customersApi.updateProfile({
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || undefined,
      });
      setProfile(updated);
      toast.success('Profile updated.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(data: ChangePasswordValues) {
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated. Please sign in again.');
      await signOut();
      router.push('/sign-in');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstMessage);
        return;
      }
      toast.error('Something went wrong.');
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className='max-w-lg mx-auto py-12 px-4 space-y-10'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Profile</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Signed in as{' '}
          <span className='font-medium text-foreground'>
            {user?.displayName ?? user?.email}
          </span>
        </p>
      </div>

      {/* Personal details */}
      <section>
        <h2 className='text-base font-semibold mb-4'>Personal details</h2>
        <form onSubmit={form.handleSubmit(handleSaveProfile)} noValidate>
          <FieldGroup className='gap-5'>
            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='firstName'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='profile-first-name'>
                      First name
                    </FieldLabel>
                    <Input
                      {...field}
                      id='profile-first-name'
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
                    <FieldLabel htmlFor='profile-last-name'>
                      Last name
                    </FieldLabel>
                    <Input
                      {...field}
                      id='profile-last-name'
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

            <Controller
              name='phone'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='profile-phone'>Phone number</FieldLabel>
                  <Input
                    {...field}
                    id='profile-phone'
                    type='tel'
                    placeholder='+48 123 456 789'
                    autoComplete='tel'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type='submit'
            className='mt-6'
            disabled={isSavingProfile || !form.formState.isDirty}
          >
            {isSavingProfile ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </section>

      {/* Change password — tylko gdy user ma credentials */}
      {hasPassword && (
        <section>
          <h2 className='text-base font-semibold mb-4'>Change password</h2>
          <ChangePasswordForm
            onSubmit={handleChangePassword}
            isLoading={isChangingPassword}
          />
        </section>
      )}

      {/* No password — link do settings */}
      {!hasPassword && profile !== null && (
        <section>
          <h2 className='text-base font-semibold mb-2'>Password</h2>
          <p className='text-sm text-muted-foreground mb-3'>
            Your account uses Google sign-in. You can add a password in
            Settings.
          </p>
          <Button variant='outline' onClick={() => router.push('/settings')}>
            Go to Settings
          </Button>
        </section>
      )}
    </div>
  );
}
