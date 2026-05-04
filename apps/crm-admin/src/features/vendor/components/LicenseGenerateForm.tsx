'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, Button, Icon, Input, NumberInput } from '@/components/ui';
import { useGenerateLicense } from '../hooks/useVendor';

const schema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  maxUsers: z.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface LicenseGenerateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LicenseGenerateForm({ onSuccess, onCancel }: LicenseGenerateFormProps) {
  const generateMut = useGenerateLicense();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      tenantId: '',
      planId: '',
      maxUsers: 5,
      expiresAt: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        tenantId: data.tenantId,
        planId: data.planId,
        maxUsers: data.maxUsers,
        expiresAt: data.expiresAt || undefined,
        notes: data.notes || undefined,
      };
      await generateMut.mutateAsync(payload);
      toast.success('License generated successfully');
      reset();
      onSuccess?.();
    } catch {
      toast.error('Failed to generate license');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
        Generate New License
      </h3>
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="tenantId"
            control={control}
            render={({ field }) => (
              <Input
                label="Tenant ID"
                leftIcon={<Icon name="building-2" size={16} />}
                value={field.value}
                onChange={(v: string) => field.onChange(v)}
                error={errors.tenantId?.message}
              />
            )}
          />
          <Controller
            name="planId"
            control={control}
            render={({ field }) => (
              <Input
                label="Plan ID"
                leftIcon={<Icon name="package" size={16} />}
                value={field.value}
                onChange={(v: string) => field.onChange(v)}
                error={errors.planId?.message}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="maxUsers"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Max Users"
                value={field.value ?? 5}
                onChange={(v) => field.onChange(v ?? 5)}
              />
            )}
          />
          <Controller
            name="expiresAt"
            control={control}
            render={({ field }) => (
              <Input
                label="Expires At"
                type="date"
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Input
                label="Notes"
                leftIcon={<Icon name="file-text" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="primary" type="submit" disabled={generateMut.isPending}>
            <Icon name="key" size={16} className="mr-2" />
            {generateMut.isPending ? 'Generating...' : 'Generate License'}
          </Button>
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
