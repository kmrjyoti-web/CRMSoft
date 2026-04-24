'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Icon, Input, NumberInput, SelectInput, Switch, Button, Card } from '@/components/ui';
import { usePlans, useCreatePlan, useUpdatePlan, usePlanLimits, useUpsertPlanLimits } from '../hooks/usePlanAdmin';
import { PlanLimitsEditor } from './PlanLimitsEditor';
import { ALL_FEATURE_FLAGS, FEATURE_LABELS, formatCurrency } from '../utils/subscription-helpers';
import type { PlanListItem, UpsertPlanLimitData } from '../types/subscription.types';

const planSchema = z.object({
  name: z.string().min(1, 'Name required'),
  code: z.string().min(1, 'Code required'),
  interval: z.string().min(1),
  price: z.number().min(0),
  maxUsers: z.number().int().min(1),
  maxContacts: z.number().int().min(0),
  maxLeads: z.number().int().min(0),
  maxProducts: z.number().int().min(0),
  maxStorage: z.number().int().min(0),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

const INTERVAL_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

export function PlanDesigner() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [limits, setLimits] = useState<UpsertPlanLimitData[]>([]);

  const { data: plans, isLoading } = usePlans();
  const { data: planLimits } = usePlanLimits(selectedPlanId ?? '');
  const createMut = useCreatePlan();
  const updateMut = useUpdatePlan();
  const upsertLimitsMut = useUpsertPlanLimits();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      name: '', code: '', interval: 'MONTHLY', price: 0,
      maxUsers: 3, maxContacts: 100, maxLeads: 50, maxProducts: 20, maxStorage: 100,
      description: '', isActive: true, sortOrder: 0,
    },
  });

  useEffect(() => {
    if (planLimits) {
      setLimits(planLimits.map((l) => ({
        resourceKey: l.resourceKey,
        limitType: l.limitType,
        limitValue: l.limitValue,
        isChargeable: l.isChargeable,
        chargeTokens: l.chargeTokens,
      })));
    }
  }, [planLimits]);

  const selectPlan = (plan: PlanListItem) => {
    setSelectedPlanId(plan.id);
    setSelectedFeatures(plan.features);
    reset({
      name: plan.name,
      code: plan.code,
      interval: plan.interval,
      price: Number(plan.price),
      maxUsers: plan.maxUsers,
      maxContacts: plan.maxContacts,
      maxLeads: plan.maxLeads,
      maxProducts: plan.maxProducts,
      maxStorage: plan.maxStorage,
      description: plan.description ?? '',
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    });
  };

  const resetForm = () => {
    setSelectedPlanId(null);
    setSelectedFeatures([]);
    setLimits([]);
    reset({
      name: '', code: '', interval: 'MONTHLY', price: 0,
      maxUsers: 3, maxContacts: 100, maxLeads: 50, maxProducts: 20, maxStorage: 100,
      description: '', isActive: true, sortOrder: 0,
    });
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      if (selectedPlanId) {
        await updateMut.mutateAsync({
          id: selectedPlanId,
          data: { ...data, features: selectedFeatures },
        });
        await upsertLimitsMut.mutateAsync({ planId: selectedPlanId, limits });
        toast.success('Plan updated');
      } else {
        const result = await createMut.mutateAsync({
          ...data,
          features: selectedFeatures,
        });
        if (result?.id) {
          await upsertLimitsMut.mutateAsync({ planId: result.id, limits });
        }
        toast.success('Plan created');
        resetForm();
      }
    } catch {
      toast.error('Failed to save plan');
    }
  };

  const toggleFeature = (flag: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag],
    );
  };

  return (
    <div className="mx-auto p-6 space-y-6" style={{ maxWidth: '1200px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan Designer</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage subscription plans</p>
        </div>
        <Button variant="primary" onClick={resetForm}>
          <Icon name="plus" size={16} className="mr-2" />
          New Plan
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Plan List Sidebar */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Existing Plans</div>
          <div className="space-y-2">
            {isLoading && <div className="animate-pulse h-20 bg-gray-100 rounded" />}
            {(plans ?? []).map((plan) => (
              <button
                key={plan.id}
                onClick={() => selectPlan(plan)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedPlanId === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatCurrency(Number(plan.price))} / {plan.interval.toLowerCase()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Plan Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <Input label="Plan Name" leftIcon={<Icon name="tag" size={16} />}
                    value={field.value} onChange={(v: string) => field.onChange(v)}
                    error={errors.name?.message} />
                )} />
                <Controller name="code" control={control} render={({ field }) => (
                  <Input label="Plan Code" leftIcon={<Icon name="hash" size={16} />}
                    value={field.value} onChange={(v: string) => field.onChange(v)}
                    error={errors.code?.message} disabled={!!selectedPlanId} />
                )} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Controller name="price" control={control} render={({ field }) => (
                  <NumberInput label="Price (INR)" value={field.value}
                    onChange={(v) => field.onChange(v ?? 0)} />
                )} />
                <Controller name="interval" control={control} render={({ field }) => (
                  <SelectInput label="Billing Interval" options={INTERVAL_OPTIONS}
                    value={field.value} onChange={(v) => field.onChange(v)} />
                )} />
              </div>
              <Controller name="description" control={control} render={({ field }) => (
                <Input label="Description" value={field.value ?? ''}
                  onChange={(v: string) => field.onChange(v)} />
              )} />
            </Card>

            {/* Base Limits */}
            <Card className="p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Base Limits
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {(['maxUsers', 'maxContacts', 'maxLeads', 'maxProducts', 'maxStorage'] as const).map((field) => (
                  <Controller key={field} name={field} control={control} render={({ field: f }) => (
                    <NumberInput
                      label={field.replace('max', '').replace(/([A-Z])/g, ' $1').trim()}
                      value={f.value}
                      onChange={(v) => f.onChange(v ?? 0)}
                    />
                  )} />
                ))}
              </div>
            </Card>

            {/* Granular Resource Limits */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Resource Limits (Granular)
              </h3>
              <PlanLimitsEditor limits={limits} onChange={setLimits} />
            </Card>

            {/* Feature Flags */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Feature Flags
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {ALL_FEATURE_FLAGS.map((flag) => (
                  <label
                    key={flag}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', cursor: 'pointer' }}
                    className="rounded-lg border border-gray-100 hover:bg-gray-50"
                  >
                    <div style={{ flexShrink: 0 }}>
                      <Switch
                        checked={selectedFeatures.includes(flag)}
                        onChange={() => toggleFeature(flag)}
                      />
                    </div>
                    <span className="text-sm text-gray-700">{FEATURE_LABELS[flag] ?? flag}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={resetForm}>
                Reset
              </Button>
              <Button variant="primary" type="submit"
                disabled={createMut.isPending || updateMut.isPending || upsertLimitsMut.isPending}
              >
                <Icon name="save" size={16} className="mr-2" />
                {selectedPlanId ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
