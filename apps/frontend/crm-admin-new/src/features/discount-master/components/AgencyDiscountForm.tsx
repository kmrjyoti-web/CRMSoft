'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Icon, Input, NumberInput, SelectInput, DatePicker, Switch, Fieldset,
} from '@/components/ui';
import { FormErrors } from '@/components/common/FormErrors';
import { useSidePanelStore } from '@/stores/side-panel.store';
import { useCreateAgencyDiscount, useUpdateAgencyDiscount } from '../hooks/useDiscount';
import type { AgencyDiscount } from '../types/discount.types';

// ── Schema ────────────────────────────────────────────────────────────

const schema = z.object({
  agentName:       z.string().min(1, 'Agent / party name is required'),
  agentType:       z.enum(['AGENT', 'DISTRIBUTOR', 'DEALER']),
  discountPercent: z.number({ invalid_type_error: 'Enter a discount %' }).min(0.01, 'Must be > 0').max(100, 'Cannot exceed 100%'),
  applicableOn:    z.enum(['ALL', 'CATEGORY', 'PRODUCT']),
  validFrom:       z.string().optional(),
  validTo:         z.string().optional(),
  isActive:        z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ── Options ───────────────────────────────────────────────────────────

const AGENT_TYPE_OPTIONS = [
  { value: 'AGENT',       label: 'Agent' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'DEALER',      label: 'Dealer' },
];

const APPLICABLE_OPTIONS = [
  { value: 'ALL',      label: 'All Products' },
  { value: 'CATEGORY', label: 'By Category' },
  { value: 'PRODUCT',  label: 'Specific Product' },
];

// ── Component ─────────────────────────────────────────────────────────

interface AgencyDiscountFormProps {
  panelId: string;
  discount?: AgencyDiscount;
}

export function AgencyDiscountForm({ panelId, discount }: AgencyDiscountFormProps) {
  const { closePanel } = useSidePanelStore();
  const createMut = useCreateAgencyDiscount();
  const updateMut = useUpdateAgencyDiscount();
  const isEdit = !!discount;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      agentName:       '',
      agentType:       'AGENT',
      discountPercent: undefined as any,
      applicableOn:    'ALL',
      validFrom:       '',
      validTo:         '',
      isActive:        true,
    },
  });

  // Pre-fill when editing
  useEffect(() => {
    if (!discount) return;
    reset({
      agentName:       discount.agentName,
      agentType:       discount.agentType,
      discountPercent: discount.discountPercent,
      applicableOn:    discount.applicableOn,
      validFrom:       discount.validFrom ?? '',
      validTo:         discount.validTo ?? '',
      isActive:        discount.isActive,
    });
  }, [discount, reset]);

  const onSubmit = async (values: FormValues) => {
    const dto = {
      ...values,
      validFrom: values.validFrom || undefined,
      validTo:   values.validTo   || undefined,
    };
    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id: discount.id, dto });
        toast.success('Discount updated');
      } else {
        await createMut.mutateAsync(dto);
        toast.success('Discount created');
      }
      closePanel(panelId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? `Failed to ${isEdit ? 'update' : 'create'} discount`);
    }
  };

  return (
    <div className="p-5 space-y-5">
      <FormErrors errors={errors} />

      <form
        id={`agency-discount-form-${panelId}`}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
      >
          {/* ── Party Information ─────────────────────────── */}
          <Fieldset label="Party Information">
            <div className="grid grid-cols-1 gap-4">
              <Controller
                name="agentName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Agent / Party Name"
                    leftIcon={<Icon name="user" size={16} />}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.agentName}
                    errorMessage={errors.agentName?.message}
                    required
                  />
                )}
              />

              <Controller
                name="agentType"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    label="Agent Type"
                    leftIcon={<Icon name="briefcase" size={16} />}
                    options={AGENT_TYPE_OPTIONS}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    error={!!errors.agentType}
                    required
                  />
                )}
              />
            </div>
          </Fieldset>

          {/* ── Discount Rules ────────────────────────────── */}
          <Fieldset label="Discount Rules" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="discountPercent"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    label="Discount %"
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v)}
                    min={0}
                    max={100}
                    step={0.5}
                    error={!!errors.discountPercent}
                    required
                  />
                )}
              />

              <Controller
                name="applicableOn"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    label="Applicable On"
                    leftIcon={<Icon name="tag" size={16} />}
                    options={APPLICABLE_OPTIONS}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    error={!!errors.applicableOn}
                    required
                  />
                )}
              />
            </div>
          </Fieldset>

          {/* ── Validity Period ───────────────────────────── */}
          <Fieldset label="Validity Period" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="validFrom"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Valid From"
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? '')}
                  />
                )}
              />

              <Controller
                name="validTo"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Valid To"
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? '')}
                  />
                )}
              />
            </div>
          </Fieldset>

          {/* ── Status ───────────────────────────────────── */}
          <Fieldset label="Status" className="mt-4">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 py-1">
                  <Switch
                    size="sm"
                    checked={field.value}
                    onChange={(v: boolean) => field.onChange(v)}
                  />
                  <span className="text-sm text-gray-700">
                    {field.value ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )}
            />
          </Fieldset>
      </form>
    </div>
  );
}
