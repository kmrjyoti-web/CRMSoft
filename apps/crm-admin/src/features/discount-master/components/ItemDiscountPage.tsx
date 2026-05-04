'use client';

import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { TableFull, Badge } from '@/components/ui';
import { useItemDiscounts, useDeleteItemDiscount } from '../hooks/useDiscount';
import type { ItemDiscount } from '../types/discount.types';

const COLUMNS = [
  { id: 'productName',   label: 'Product',       visible: true },
  { id: 'productCode',   label: 'Code',          visible: true },
  { id: 'discountType',  label: 'Discount Type', visible: true },
  { id: 'discountValue', label: 'Value',         visible: true },
  { id: 'qtyRange',      label: 'Qty Range',     visible: true },
  { id: 'validFrom',     label: 'Valid From',    visible: true },
  { id: 'validTo',       label: 'Valid To',      visible: true },
  { id: 'status',        label: 'Status',        visible: true },
];

const TYPE_COLORS: Record<string, 'primary' | 'warning' | 'secondary'> = {
  FLAT: 'primary', PERCENT: 'warning', SLAB: 'secondary',
};

export function ItemDiscountPage() {
  const { data, isLoading } = useItemDiscounts();
  const deleteMut = useDeleteItemDiscount();

  const items: ItemDiscount[] = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(() => items.map((d) => ({
    id: d.id,
    _raw: d,
    productName:   d.productName,
    productCode:   <code style={{ fontSize: 11, background: '#f3f4f6', padding: '1px 5px', borderRadius: 4 }}>{d.productCode}</code>,
    discountType:  <Badge variant={TYPE_COLORS[d.discountType] ?? 'secondary'}>{d.discountType}</Badge>,
    discountValue: d.discountType === 'PERCENT'
      ? <span style={{ fontWeight: 600, color: '#dc2626' }}>{d.discountValue}%</span>
      : <span style={{ fontWeight: 600, color: '#2563eb' }}>₹{d.discountValue.toLocaleString('en-IN')}</span>,
    qtyRange:      d.minQty != null
      ? `${d.minQty} – ${d.maxQty ?? '∞'}`
      : '—',
    validFrom:     d.validFrom ? new Date(d.validFrom).toLocaleDateString('en-IN') : '—',
    validTo:       d.validTo   ? new Date(d.validTo).toLocaleDateString('en-IN')   : '—',
    status:        <Badge variant={d.isActive ? 'success' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>,
  })), [items]);

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete discount for "${row.productName}"?`)) return;
    try {
      await deleteMut.mutateAsync(row.id);
      toast.success('Discount deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <TableFull
      data={rows}
      title="Item Wise Discount"
      tableKey="item-discounts"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={() => { toast('Edit — coming soon'); }}
      onRowDelete={handleDelete}
      onCreate={() => { toast('Create — coming soon'); }}
    />
  );
}
