'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Button, SelectInput, Icon } from '@/components/ui';

import {
  useGoogleContactsSettings,
  useUpdateGoogleContactsSettings,
} from '../hooks/useGoogleIntegration';

const schema = z.object({
  syncDirection: z.enum(['ONE_WAY_TO_CRM', 'ONE_WAY_FROM_CRM', 'TWO_WAY']),
  conflictResolution: z.enum(['crm_wins', 'google_wins', 'newer_wins']),
});

type FormValues = z.infer<typeof schema>;

export function GoogleContactsSettings() {
  const { data } = useGoogleContactsSettings();
  const updateMut = useUpdateGoogleContactsSettings();

  const settings = data?.data;

  const { handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      syncDirection: 'TWO_WAY',
      conflictResolution: 'newer_wins',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        syncDirection: settings.syncDirection ?? 'TWO_WAY',
        conflictResolution: settings.conflictResolution ?? 'newer_wins',
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: FormValues) => {
    updateMut.mutate(data, {
      onSuccess: () => toast.success('Contacts settings updated'),
      onError: () => toast.error('Failed to update settings'),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectInput
          label="Sync Direction"
          leftIcon={<Icon name="repeat" size={16} />}
          value={watch('syncDirection')}
          onChange={(v) => setValue('syncDirection', v as FormValues['syncDirection'])}
          options={[
            { value: 'ONE_WAY_TO_CRM', label: 'Google → CRM (one-way)' },
            { value: 'ONE_WAY_FROM_CRM', label: 'CRM → Google (one-way)' },
            { value: 'TWO_WAY', label: 'Two-way sync' },
          ]}
        />
        <SelectInput
          label="Conflict Resolution"
          leftIcon={<Icon name="git-branch" size={16} />}
          value={watch('conflictResolution')}
          onChange={(v) => setValue('conflictResolution', v as FormValues['conflictResolution'])}
          options={[
            { value: 'crm_wins', label: 'CRM data wins' },
            { value: 'google_wins', label: 'Google data wins' },
            { value: 'newer_wins', label: 'Newer data wins' },
          ]}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={updateMut.isPending}
      >
        {updateMut.isPending ? 'Saving...' : 'Save Contacts Settings'}
      </Button>
    </form>
  );
}
