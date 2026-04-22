'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Input, SelectInput, Button, Icon, DatePicker, NumberInput } from '@/components/ui';
import { useCreateShareLink } from '../hooks/useShareLinks';
import type { ShareLinkAccess } from '../types/documents.types';

const schema = z.object({
  access: z.string().min(1),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
  maxViews: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof schema>;

const ACCESS_OPTIONS: { value: ShareLinkAccess; label: string }[] = [
  { value: 'VIEW', label: 'View Only' },
  { value: 'DOWNLOAD', label: 'View & Download' },
  { value: 'EDIT', label: 'Edit' },
];

interface ShareLinkFormProps {
  documentId: string;
  onClose?: () => void;
}

export function ShareLinkForm({ documentId, onClose }: ShareLinkFormProps) {
  const createMut = useCreateShareLink();

  const { handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      access: 'VIEW',
    },
  });

  const onSubmit = (data: FormValues) => {
    createMut.mutate(
      { documentId, data: { ...data, access: data.access as ShareLinkAccess } },
      {
        onSuccess: () => { toast.success('Share link created'); onClose?.(); },
        onError: () => toast.error('Failed to create share link'),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-4 p-4">
      <SelectInput
        label="Access Level"
        leftIcon={<Icon name="shield" size={16} />}
        value={watch('access')}
        onChange={(v) => setValue('access', v as string)}
        options={ACCESS_OPTIONS}
      />
      <Input
        label="Password (optional)"
        leftIcon={<Icon name="lock" size={16} />}
        value={watch('password') ?? ''}
        onChange={(v) => setValue('password', v || undefined)}
        type="password"
      />
      <DatePicker
        label="Expiry Date (optional)"
        value={watch('expiresAt') ? new Date(watch('expiresAt')!) : null}
        onChange={(v) => setValue('expiresAt', v ? v.toISOString() : undefined)}
      />
      <NumberInput
        label="Max Views (optional)"
        value={watch('maxViews') ?? null}
        onChange={(v) => setValue('maxViews', v ?? undefined)}
      />
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" size="sm" disabled={createMut.isPending}>
          {createMut.isPending ? 'Creating...' : 'Create Link'}
        </Button>
        {onClose && (
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
