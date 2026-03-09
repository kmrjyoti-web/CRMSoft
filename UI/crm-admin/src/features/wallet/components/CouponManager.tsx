'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Icon, Input, NumberInput, SelectInput, Button, Card, Badge } from '@/components/ui';
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../hooks/useWalletAdmin';
import type { CouponItem } from '../types/wallet.types';

const schema = z.object({
  code: z.string().min(1, 'Code required'),
  type: z.enum(['FIXED_TOKENS', 'PERCENTAGE']),
  value: z.number().int().min(1),
  maxUses: z.number().int().min(1).optional(),
  minRecharge: z.number().min(0).optional(),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TYPE_OPTIONS = [
  { value: 'FIXED_TOKENS', label: 'Fixed Tokens' },
  { value: 'PERCENTAGE', label: 'Percentage' },
];

export function CouponManager() {
  const [editId, setEditId] = useState<string | null>(null);
  const { data: couponsResponse, isLoading } = useAdminCoupons();
  const coupons: CouponItem[] = Array.isArray(couponsResponse?.data) ? couponsResponse.data : [];
  const createMut = useCreateCoupon();
  const updateMut = useUpdateCoupon();
  const deleteMut = useDeleteCoupon();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { code: '', type: 'FIXED_TOKENS', value: 0, maxUses: 1 },
  });

  const startEdit = (coupon: CouponItem) => {
    setEditId(coupon.id);
    reset({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxUses: coupon.maxUses,
      minRecharge: coupon.minRecharge ? Number(coupon.minRecharge) : undefined,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : '',
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data });
        toast.success('Coupon updated');
      } else {
        await createMut.mutateAsync(data);
        toast.success('Coupon created');
      }
      setEditId(null);
      reset({ code: '', type: 'FIXED_TOKENS', value: 0, maxUses: 1 });
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">
          {editId ? 'Edit Coupon' : 'New Coupon'}
        </h3>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Controller name="code" control={control} render={({ field }) => (
              <Input label="Code" leftIcon={<Icon name="tag" size={16} />}
                value={field.value} onChange={(v: string) => field.onChange(v.toUpperCase())} error={errors.code?.message} />
            )} />
            <Controller name="type" control={control} render={({ field }) => (
              <SelectInput label="Type" options={TYPE_OPTIONS} value={field.value} onChange={(v) => field.onChange(v)} />
            )} />
            <Controller name="value" control={control} render={({ field }) => (
              <NumberInput label="Value" value={field.value} onChange={(v) => field.onChange(v ?? 0)} />
            )} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Controller name="maxUses" control={control} render={({ field }) => (
              <NumberInput label="Max Uses" value={field.value ?? 1} onChange={(v) => field.onChange(v ?? 1)} />
            )} />
            <Controller name="minRecharge" control={control} render={({ field }) => (
              <NumberInput label="Min Recharge (INR)" value={field.value ?? 0} onChange={(v) => field.onChange(v ?? 0)} />
            )} />
            <Controller name="expiresAt" control={control} render={({ field }) => (
              <Input label="Expires At" value={field.value ?? ''} onChange={(v: string) => field.onChange(v)} type="date" />
            )} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" type="submit" disabled={createMut.isPending || updateMut.isPending}>
              {editId ? 'Update' : 'Create'}
            </Button>
            {editId && (
              <Button variant="outline" type="button" onClick={() => {
                setEditId(null);
                reset({ code: '', type: 'FIXED_TOKENS', value: 0, maxUses: 1 });
              }}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="divide-y divide-gray-100">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Badge variant="primary" className="font-mono">{c.code}</Badge>
                <span className="text-sm text-gray-600">
                  {c.type === 'FIXED_TOKENS' ? `${c.value} tokens` : `${c.value}%`}
                </span>
                <span className="text-xs text-gray-400">
                  Used: {c.usedCount}/{c.maxUses}
                </span>
                {c.expiresAt && (
                  <span className="text-xs text-gray-400">
                    Expires: {new Date(c.expiresAt).toLocaleDateString()}
                  </span>
                )}
                {!c.isActive && <Badge variant="danger">Inactive</Badge>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(c)} className="p-1 rounded hover:bg-gray-100">
                  <Icon name="pencil" size={14} className="text-gray-500" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-1 rounded hover:bg-red-50">
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
