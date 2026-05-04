'use client';

import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { TableFull, Badge } from '@/components/ui';
import { usePromotions, useDeletePromotion } from '../hooks/useDiscount';
import type { Promotion } from '../types/discount.types';

const COLUMNS = [
  { id: 'name',          label: 'Promotion',     visible: true },
  { id: 'promotionType', label: 'Type',          visible: true },
  { id: 'discount',      label: 'Discount',      visible: true },
  { id: 'minOrder',      label: 'Min Order',     visible: true },
  { id: 'startDate',     label: 'Start',         visible: true },
  { id: 'endDate',       label: 'End',           visible: true },
  { id: 'status',        label: 'Status',        visible: true },
];

const TYPE_COLORS: Record<string, 'primary' | 'warning' | 'success' | 'secondary' | 'danger'> = {
  SEASONAL: 'warning', BUNDLE: 'primary', COMBO: 'success', CLEARANCE: 'danger', LOYALTY: 'secondary',
};

export function PromotionsPage() {
  const { data, isLoading } = usePromotions();
  const deleteMut = useDeletePromotion();

  const items: Promotion[] = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(() => items.map((p) => ({
    id: p.id,
    _raw: p,
    name:          (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
        {p.description && <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.description}</div>}
      </div>
    ),
    promotionType: <Badge variant={TYPE_COLORS[p.promotionType] ?? 'secondary'}>{p.promotionType}</Badge>,
    discount:      p.discountPercent != null
      ? <span style={{ fontWeight: 600, color: '#dc2626' }}>{p.discountPercent}%</span>
      : p.discountFlat != null
        ? <span style={{ fontWeight: 600, color: '#2563eb' }}>₹{p.discountFlat.toLocaleString('en-IN')}</span>
        : '—',
    minOrder:      p.minOrderValue != null ? `₹${p.minOrderValue.toLocaleString('en-IN')}` : '—',
    startDate:     new Date(p.startDate).toLocaleDateString('en-IN'),
    endDate:       new Date(p.endDate).toLocaleDateString('en-IN'),
    status:        <Badge variant={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>,
  })), [items]);

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete promotion "${row._raw.name}"?`)) return;
    try {
      await deleteMut.mutateAsync(row.id);
      toast.success('Promotion deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <TableFull
      data={rows}
      title="Sales Promotions"
      tableKey="promotions"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={() => { toast('Edit — coming soon'); }}
      onRowDelete={handleDelete}
      onCreate={() => { toast('Create — coming soon'); }}
    />
  );
}
