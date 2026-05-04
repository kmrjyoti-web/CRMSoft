'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Icon, Input, NumberInput, SelectInput, Button, Card, Badge } from '@/components/ui';
import { useAdminServiceRates, useCreateServiceRate, useUpdateServiceRate, useDeleteServiceRate } from '../hooks/useWalletAdmin';
import { formatTokens } from '../utils/wallet-helpers';
import type { ServiceRateItem } from '../types/wallet.types';

const schema = z.object({
  serviceKey: z.string().min(1, 'Service key required'),
  displayName: z.string().min(1, 'Display name required'),
  category: z.string().min(1, 'Category required'),
  baseTokens: z.number().int().min(1),
  marginPct: z.number().int().min(0).optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORY_OPTIONS = [
  { value: 'AI', label: 'AI' },
  { value: 'SMS', label: 'SMS' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'OTHER', label: 'Other' },
];

export function ServiceRateManager() {
  const [editId, setEditId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const { data: ratesResponse, isLoading } = useAdminServiceRates(filterCategory || undefined);
  const rates: ServiceRateItem[] = Array.isArray(ratesResponse?.data) ? ratesResponse.data : [];
  const createMut = useCreateServiceRate();
  const updateMut = useUpdateServiceRate();
  const deleteMut = useDeleteServiceRate();

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { serviceKey: '', displayName: '', category: 'AI', baseTokens: 10, marginPct: 20, description: '' },
  });

  const baseTokens = watch('baseTokens');
  const marginPct = watch('marginPct');
  const previewFinal = Math.ceil((baseTokens ?? 10) * (1 + (marginPct ?? 20) / 100));

  const startEdit = (rate: ServiceRateItem) => {
    setEditId(rate.id);
    reset({
      serviceKey: rate.serviceKey,
      displayName: rate.displayName,
      category: rate.category,
      baseTokens: rate.baseTokens,
      marginPct: rate.marginPct,
      description: rate.description ?? '',
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data });
        toast.success('Service rate updated');
      } else {
        await createMut.mutateAsync(data);
        toast.success('Service rate created');
      }
      setEditId(null);
      reset({ serviceKey: '', displayName: '', category: 'AI', baseTokens: 10, marginPct: 20, description: '' });
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service rate?')) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Service Rates</h1>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">
          {editId ? 'Edit Rate' : 'New Rate'}
        </h3>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Controller name="serviceKey" control={control} render={({ field }) => (
              <Input label="Service Key" leftIcon={<Icon name="key" size={16} />}
                value={field.value} onChange={(v: string) => field.onChange(v)} error={errors.serviceKey?.message}
                disabled={!!editId} />
            )} />
            <Controller name="displayName" control={control} render={({ field }) => (
              <Input label="Display Name" value={field.value} onChange={(v: string) => field.onChange(v)} error={errors.displayName?.message} />
            )} />
            <Controller name="category" control={control} render={({ field }) => (
              <SelectInput label="Category" options={CATEGORY_OPTIONS} value={field.value} onChange={(v) => field.onChange(v)} />
            )} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Controller name="baseTokens" control={control} render={({ field }) => (
              <NumberInput label="Base Tokens" value={field.value} onChange={(v) => field.onChange(v ?? 0)} />
            )} />
            <Controller name="marginPct" control={control} render={({ field }) => (
              <NumberInput label="Margin %" value={field.value ?? 20} onChange={(v) => field.onChange(v ?? 0)} />
            )} />
            <div className="flex items-end">
              <div className="p-2 bg-blue-50 rounded-lg text-sm text-blue-700 font-medium w-full text-center">
                Final: {formatTokens(previewFinal)} tokens
              </div>
            </div>
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
                reset({ serviceKey: '', displayName: '', category: 'AI', baseTokens: 10, marginPct: 20, description: '' });
              }}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      {/* Filter */}
      <div className="w-48">
        <SelectInput
          label="Filter Category"
          options={[{ value: '', label: 'All' }, ...CATEGORY_OPTIONS]}
          value={filterCategory}
          onChange={(v) => setFilterCategory(v as string)}
        />
      </div>

      {/* List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Service</th>
                <th className="text-left py-2 text-gray-500 font-medium">Category</th>
                <th className="text-right py-2 text-gray-500 font-medium">Base</th>
                <th className="text-right py-2 text-gray-500 font-medium">Margin</th>
                <th className="text-right py-2 text-gray-500 font-medium">Final</th>
                <th className="text-right py-2 text-gray-500 font-medium">Status</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="py-2.5">
                    <div className="font-medium text-gray-900">{rate.displayName}</div>
                    <div className="text-xs text-gray-400 font-mono">{rate.serviceKey}</div>
                  </td>
                  <td className="py-2.5">
                    <Badge variant="default">{rate.category}</Badge>
                  </td>
                  <td className="py-2.5 text-right">{formatTokens(rate.baseTokens)}</td>
                  <td className="py-2.5 text-right text-gray-500">{rate.marginPct}%</td>
                  <td className="py-2.5 text-right font-medium text-blue-600">{formatTokens(rate.finalTokens)}</td>
                  <td className="py-2.5 text-right">
                    <Badge variant={rate.isActive ? 'success' : 'danger'}>
                      {rate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(rate)} className="p-1 rounded hover:bg-gray-100">
                        <Icon name="pencil" size={14} className="text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(rate.id)} className="p-1 rounded hover:bg-red-50">
                        <Icon name="trash-2" size={14} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
