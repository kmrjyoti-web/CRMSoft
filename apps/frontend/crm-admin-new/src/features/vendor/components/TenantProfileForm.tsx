'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, Button, Icon, Input, SelectInput } from '@/components/ui';
import { useTenantProfile, useUpdateTenantProfile } from '../hooks/useVendor';
import { DB_STRATEGY_OPTIONS } from '../utils/vendor-helpers';

const schema = z.object({
  companyLegalName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  supportEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  dbStrategy: z.enum(['SHARED', 'DEDICATED']),
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  primaryContactPhone: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TenantProfileFormProps {
  tenantId: string;
}

export function TenantProfileForm({ tenantId }: TenantProfileFormProps) {
  const { data: profileResp, isLoading } = useTenantProfile(tenantId);
  const updateMut = useUpdateTenantProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      companyLegalName: '',
      industry: '',
      website: '',
      supportEmail: '',
      dbStrategy: 'SHARED',
      primaryContactName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      gstin: '',
      pan: '',
      notes: '',
    },
  });

  // Populate form when profile loads
  useEffect(() => {
    const profile = profileResp?.data;
    if (profile) {
      reset({
        companyLegalName: profile.companyLegalName ?? '',
        industry: profile.industry ?? '',
        website: profile.website ?? '',
        supportEmail: profile.supportEmail ?? '',
        dbStrategy: profile.dbStrategy ?? 'SHARED',
        primaryContactName: profile.primaryContactName ?? '',
        primaryContactEmail: profile.primaryContactEmail ?? '',
        primaryContactPhone: profile.primaryContactPhone ?? '',
        gstin: profile.gstin ?? '',
        pan: profile.pan ?? '',
        notes: profile.notes ?? '',
      });
    }
  }, [profileResp, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateMut.mutateAsync({ tenantId, data });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {/* Company Information */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="companyLegalName"
            control={control}
            render={({ field }) => (
              <Input
                label="Company Legal Name"
                leftIcon={<Icon name="building-2" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
                error={errors.companyLegalName?.message}
              />
            )}
          />
          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <Input
                label="Industry"
                leftIcon={<Icon name="briefcase" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <Input
                label="Website"
                leftIcon={<Icon name="globe" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
                error={errors.website?.message}
              />
            )}
          />
          <Controller
            name="supportEmail"
            control={control}
            render={({ field }) => (
              <Input
                label="Support Email"
                leftIcon={<Icon name="mail" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
                error={errors.supportEmail?.message}
              />
            )}
          />
          <Controller
            name="dbStrategy"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Database Strategy"
                options={DB_STRATEGY_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
        </div>
      </Card>

      {/* Primary Contact */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Primary Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="primaryContactName"
            control={control}
            render={({ field }) => (
              <Input
                label="Contact Name"
                leftIcon={<Icon name="user" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
          <Controller
            name="primaryContactEmail"
            control={control}
            render={({ field }) => (
              <Input
                label="Contact Email"
                leftIcon={<Icon name="mail" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
                error={errors.primaryContactEmail?.message}
              />
            )}
          />
          <Controller
            name="primaryContactPhone"
            control={control}
            render={({ field }) => (
              <Input
                label="Contact Phone"
                leftIcon={<Icon name="phone" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
        </div>
      </Card>

      {/* Tax & Legal */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Tax & Legal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="gstin"
            control={control}
            render={({ field }) => (
              <Input
                label="GSTIN"
                leftIcon={<Icon name="file-text" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
          <Controller
            name="pan"
            control={control}
            render={({ field }) => (
              <Input
                label="PAN"
                leftIcon={<Icon name="credit-card" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Notes
        </h3>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Input
              label="Internal Notes"
              leftIcon={<Icon name="file-text" size={16} />}
              value={field.value ?? ''}
              onChange={(v: string) => field.onChange(v)}
            />
          )}
        />
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={() => reset()}
          disabled={!isDirty}
        >
          Discard Changes
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!isDirty || updateMut.isPending}
        >
          <Icon name="save" size={16} className="mr-2" />
          {updateMut.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
