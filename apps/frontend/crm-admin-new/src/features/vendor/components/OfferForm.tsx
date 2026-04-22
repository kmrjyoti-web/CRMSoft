'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, Icon, Input, NumberInput, SelectInput, Switch } from '@/components/ui';
import { OFFER_TYPE_OPTIONS } from '../utils/vendor-helpers';
import type { SoftwareOfferItem } from '../types/vendor.types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  offerType: z.string().min(1, 'Type is required'),
  value: z.number().min(0, 'Value must be positive'),
  validFrom: z.string().min(1, 'Start date is required'),
  validTo: z.string().min(1, 'End date is required'),
  maxRedemptions: z.number().int().min(0).optional(),
  autoApply: z.boolean().optional(),
  terms: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface OfferFormProps {
  editOffer?: SoftwareOfferItem | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  isPending?: boolean;
}

export function OfferForm({ editOffer, onSubmit, onCancel, isPending }: OfferFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      code: '',
      description: '',
      offerType: 'TRIAL_EXTENSION',
      value: 0,
      validFrom: '',
      validTo: '',
      maxRedemptions: 100,
      autoApply: false,
      terms: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editOffer) {
      reset({
        name: editOffer.name,
        code: editOffer.code,
        description: editOffer.description ?? '',
        offerType: editOffer.offerType,
        value: editOffer.value,
        validFrom: editOffer.validFrom ? new Date(editOffer.validFrom).toISOString().slice(0, 10) : '',
        validTo: editOffer.validTo ? new Date(editOffer.validTo).toISOString().slice(0, 10) : '',
        maxRedemptions: editOffer.maxRedemptions,
        autoApply: editOffer.autoApply,
        terms: editOffer.terms ?? '',
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        offerType: 'TRIAL_EXTENSION',
        value: 0,
        validFrom: '',
        validTo: '',
        maxRedemptions: 100,
        autoApply: false,
        terms: '',
      });
    }
  }, [editOffer, reset]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    if (!editOffer) {
      reset();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
        {editOffer ? 'Edit Offer' : 'New Offer'}
      </h3>
      <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                label="Offer Name"
                leftIcon={<Icon name="tag" size={16} />}
                value={field.value}
                onChange={(v: string) => field.onChange(v)}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input
                label="Code"
                leftIcon={<Icon name="hash" size={16} />}
                value={field.value}
                onChange={(v: string) => field.onChange(v.toUpperCase())}
                error={errors.code?.message}
              />
            )}
          />
          <Controller
            name="offerType"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Offer Type"
                options={OFFER_TYPE_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Value"
                value={field.value}
                onChange={(v) => field.onChange(v ?? 0)}
              />
            )}
          />
          <Controller
            name="validFrom"
            control={control}
            render={({ field }) => (
              <Input
                label="Valid From"
                type="date"
                value={field.value}
                onChange={(v: string) => field.onChange(v)}
                error={errors.validFrom?.message}
              />
            )}
          />
          <Controller
            name="validTo"
            control={control}
            render={({ field }) => (
              <Input
                label="Valid To"
                type="date"
                value={field.value}
                onChange={(v: string) => field.onChange(v)}
                error={errors.validTo?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="maxRedemptions"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Max Redemptions"
                value={field.value ?? 100}
                onChange={(v) => field.onChange(v ?? 100)}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                label="Description"
                leftIcon={<Icon name="file-text" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <Input
                label="Terms & Conditions"
                leftIcon={<Icon name="scroll-text" size={16} />}
                value={field.value ?? ''}
                onChange={(v: string) => field.onChange(v)}
              />
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <Controller
            name="autoApply"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  label="Auto Apply"
                  checked={field.value ?? false}
                  onChange={(checked: boolean) => field.onChange(checked)}
                />
              </div>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="primary" type="submit" disabled={isPending}>
            {editOffer ? 'Update Offer' : 'Create Offer'}
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
