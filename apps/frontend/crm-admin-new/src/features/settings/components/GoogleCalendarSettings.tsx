'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Button, SelectInput, Input, Icon } from '@/components/ui';

import {
  useGoogleCalendarSettings,
  useUpdateGoogleCalendarSettings,
} from '../hooks/useGoogleIntegration';

const schema = z.object({
  syncDirection: z.enum(['ONE_WAY_TO_CRM', 'ONE_WAY_FROM_CRM', 'TWO_WAY']),
  syncFrequencyMinutes: z.coerce.number().min(5).max(1440),
});

type FormValues = z.infer<typeof schema>;

export function GoogleCalendarSettings() {
  const { data } = useGoogleCalendarSettings();
  const updateMut = useUpdateGoogleCalendarSettings();

  const settings = data?.data;

  const { handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      syncDirection: 'TWO_WAY',
      syncFrequencyMinutes: 15,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        syncDirection: settings.syncDirection ?? 'TWO_WAY',
        syncFrequencyMinutes: settings.syncFrequencyMinutes ?? 15,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: FormValues) => {
    updateMut.mutate(data, {
      onSuccess: () => toast.success('Calendar settings updated'),
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
        <Input
          label="Sync Frequency (minutes)"
          leftIcon={<Icon name="clock" size={16} />}
          value={String(watch('syncFrequencyMinutes'))}
          onChange={(v) => setValue('syncFrequencyMinutes', Number(v) || 15)}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={updateMut.isPending}
      >
        {updateMut.isPending ? 'Saving...' : 'Save Calendar Settings'}
      </Button>
    </form>
  );
}
