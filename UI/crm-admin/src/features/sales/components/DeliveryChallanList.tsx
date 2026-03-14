'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { TableFull, Badge } from '@/components/ui';
import { Icon } from '@/components/ui';

import { useDeliveryChallanList } from '../hooks/useSales';
import type { DeliveryChallan } from '../types/sales.types';

// ── Column definitions ──────────────────────────────────────

const CHALLAN_COLUMNS = [
  { id: 'challanNumber', label: 'Challan No', visible: true },
  { id: 'customerType', label: 'Customer Type', visible: true },
  { id: 'saleOrderDisplay', label: 'Sale Order', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'fromLocationId', label: 'From Location', visible: true },
  { id: 'totalAmount', label: 'Total Amount', visible: true },
  { id: 'dispatchDate', label: 'Dispatch Date', visible: true },
  { id: 'deliveryDate', label: 'Delivery Date', visible: true },
];

// ── Status badge mapping ────────────────────────────────────

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  DRAFT: 'default',
  DISPATCHED: 'warning',
  IN_TRANSIT: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

// ── Helpers ─────────────────────────────────────────────────

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '\u2014';
  return `\u20B9${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '\u2014';
  return new Date(value).toLocaleDateString('en-IN');
}

function flattenChallans(items: DeliveryChallan[]): Record<string, unknown>[] {
  return items.map((dc) => ({
    id: dc.id,
    challanNumber: dc.challanNumber,
    customerType: dc.customerType,
    saleOrderDisplay: dc.saleOrderId || '\u2014',
    status: dc.status,
    _statusBadge: (
      <Badge variant={STATUS_VARIANT[dc.status] ?? 'default'}>{dc.status}</Badge>
    ),
    fromLocationId: dc.fromLocationId,
    totalAmount: formatCurrency(dc.totalAmount),
    dispatchDate: formatDate(dc.dispatchDate),
    deliveryDate: formatDate(dc.deliveryDate),
  }));
}

// ── Component ───────────────────────────────────────────────

export function DeliveryChallanList() {
  const router = useRouter();
  const { data, isLoading } = useDeliveryChallanList();

  const responseData = data?.data;
  const items: DeliveryChallan[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: DeliveryChallan[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenChallans(items), [items]);

  function handleRowEdit(row: Record<string, any>) {
    router.push(`/sales/delivery-challans/${row.id}`);
  }

  function handleCreate() {
    router.push('/sales/delivery-challans/new');
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Icon name="loader" size={24} className="animate-spin" /> Loading delivery challans...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Delivery Challans"
        columns={CHALLAN_COLUMNS}
        tableKey="delivery-challans"
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
