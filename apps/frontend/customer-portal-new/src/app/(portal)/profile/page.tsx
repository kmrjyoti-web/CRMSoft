'use client';

import { useState } from 'react';
import { User, Lock, Shield, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useUpdateProfile, useChangePassword } from '@/hooks/usePortal';
import { getInitials } from '@/lib/utils';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      displayName: user?.displayName ?? '',
      phone: '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema) as any,
  });

  const onProfileSubmit = async (values: ProfileForm) => {
    await updateProfile.mutateAsync(values);
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    passwordForm.reset();
    setPwdSuccess(true);
    setTimeout(() => setPwdSuccess(false), 4000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar + info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {user?.displayName ? getInitials(user.displayName) : 'C'}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.displayName ?? 'Customer'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user?.isActive ? 'success' : 'danger'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="muted">{user?.linkedEntityType}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit as any)} className="space-y-4">
            <Input
              label="Display Name"
              placeholder="Your name"
              error={profileForm.formState.errors.displayName?.message}
              {...profileForm.register('displayName')}
            />
            <Input
              label="Phone (optional)"
              placeholder="+91 9876543210"
              {...profileForm.register('phone')}
            />
            <div className="pt-2">
              <Button
                type="submit"
                loading={updateProfile.isPending}
                disabled={updateProfile.isPending}
                size="sm"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pwdSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">Password changed successfully!</p>
            </div>
          )}
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit as any)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
            <div className="pt-2">
              <Button
                type="submit"
                loading={changePassword.isPending}
                disabled={changePassword.isPending}
                size="sm"
              >
                <Lock className="h-4 w-4" />
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user?.email}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">Account Type</dt>
              <dd className="font-medium">{user?.linkedEntityType}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">Total Logins</dt>
              <dd className="font-medium">{user?.loginCount ?? 0}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
