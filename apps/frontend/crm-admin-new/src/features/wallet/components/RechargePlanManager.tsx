'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Icon, Input, NumberInput, Switch, Button, Card, Badge } from '@/components/ui';
import {
  useAdminRechargePlans, useCreateRechargePlan, useUpdateRechargePlan, useDeleteRechargePlan,
} from '../hooks/useWalletAdmin';
import { formatTokens, formatCurrency } from '../utils/wallet-helpers';
import type { RechargePlanItem } from '../types/wallet.types';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  amount: z.number().min(1),
  tokens: z.number().int().min(1),
  bonusTokens: z.number().int().min(0).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

type FormData = z.infer<typeof schema>;

export function RechargePlanManager() {
  const [editId, setEditId] = useState<string | null>(null);
  const { data: plansResponse, isLoading } = useAdminRechargePlans();
  const plans: RechargePlanItem[] = Array.isArray(plansResponse?.data) ? plansResponse.data : [];
  const createMut = useCreateRechargePlan();
  const updateMut = useUpdateRechargePlan();
  const deleteMut = useDeleteRechargePlan();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '', amount: 0, tokens: 0, bonusTokens: 0, description: '', sortOrder: 0 },
  });

  const startEdit = (plan: RechargePlanItem) => {
    setEditId(plan.id);
    reset({
      name: plan.name,
      amount: Number(plan.amount),
      tokens: plan.tokens,
      bonusTokens: plan.bonusTokens,
      description: plan.description ?? '',
      sortOrder: plan.sortOrder,
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data });
        toast.success('Recharge plan updated');
      } else {
        await createMut.mutateAsync(data);
        toast.success('Recharge plan created');
      }
      setEditId(null);
      reset({ name: '', amount: 0, tokens: 0, bonusTokens: 0, description: '', sortOrder: 0 });
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recharge plan?')) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recharge Plans</h1>

      {/* Form */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">
          {editId ? 'Edit Plan' : 'New Plan'}
        </h3>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Controller name="name" control={control} render={({ field }) => (
              <Input label="Name" value={field.value} onChange={(v: string) => field.onChange(v)} error={errors.name?.message} />
            )} />
            <Controller name="amount" control={control} render={({ field }) => (
              <NumberInput label="Amount (INR)" value={field.value} onChange={(v) => field.onChange(v ?? 0)} />
            )} />
            <Controller name="tokens" control={control} render={({ field }) => (
              <NumberInput label="Tokens" value={field.value} onChange={(v) => field.onChange(v ?? 0)} />
            )} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Controller name="bonusTokens" control={control} render={({ field }) => (
              <NumberInput label="Bonus Tokens" value={field.value ?? 0} onChange={(v) => field.onChange(v ?? 0)} />
            )} />
            <Controller name="sortOrder" control={control} render={({ field }) => (
              <NumberInput label="Sort Order" value={field.value ?? 0} onChange={(v) => field.onChange(v ?? 0)} />
            )} />
            <Controller name="description" control={control} render={({ field }) => (
              <Input label="Description" value={field.value ?? ''} onChange={(v: string) => field.onChange(v)} />
            )} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" type="submit" disabled={createMut.isPending || updateMut.isPending}>
              {editId ? 'Update' : 'Create'}
            </Button>
            {editId && (
              <Button variant="outline" type="button" onClick={() => {
                setEditId(null);
                reset({ name: '', amount: 0, tokens: 0, bonusTokens: 0, description: '', sortOrder: 0 });
              }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* List */}
      <Card className="p-6">
        <div className="divide-y divide-gray-100">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                  {!plan.isActive && <Badge variant="danger" className="ml-2">Inactive</Badge>}
                </div>
                <span className="text-sm text-gray-500">{formatCurrency(Number(plan.amount))}</span>
                <span className="text-sm text-blue-600">{formatTokens(plan.tokens)} tokens</span>
                {plan.bonusTokens > 0 && (
                  <Badge variant="success">+{formatTokens(plan.bonusTokens)} bonus</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(plan)} className="p-1 rounded hover:bg-gray-100">
                  <Icon name="pencil" size={14} className="text-gray-500" />
                </button>
                <button onClick={() => handleDelete(plan.id)} className="p-1 rounded hover:bg-red-50">
                  <Icon name="trash-2" size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
