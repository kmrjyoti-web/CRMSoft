'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { TableFull, Badge } from '@/components/ui';
import { Icon } from '@/components/ui';

import { useSaleReturnList } from '../hooks/useSales';
import type { SaleReturn } from '../types/sales.types';
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

// ── Column definitions ──────────────────────────────────────

const RETURN_COLUMNS = [
  { id: 'returnNumber', label: 'Return No', visible: true },
  { id: 'customerType', label: 'Customer Type', visible: true },
  { id: 'returnReason', label: 'Return Reason', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'returnDate', label: 'Return Date', visible: true },
  { id: 'grandTotal', label: 'Grand Total', visible: true },
  { id: 'creditNoteId', label: 'Credit Note', visible: true },
];

// ── Status badge mapping ────────────────────────────────────

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  DRAFT: 'default',
  RECEIVED: 'warning',
  INSPECTED: 'primary',
  ACCEPTED: 'success',
  REJECTED: 'danger',
};

// ── Helpers ─────────────────────────────────────────────────



function flattenReturns(items: SaleReturn[]): Record<string, unknown>[] {
  return items.map((sr) => ({
    id: sr.id,
    returnNumber: sr.returnNumber,
    customerType: sr.customerType,
    returnReason: sr.returnReason,
    status: sr.status,
    _statusBadge: (
      <Badge variant={STATUS_VARIANT[sr.status] ?? 'default'}>{sr.status}</Badge>
    ),
    returnDate: formatDate(sr.returnDate),
    grandTotal: formatCurrency(sr.grandTotal),
    creditNoteId: sr.creditNoteId || '\u2014',
  }));
}

// ── Component ───────────────────────────────────────────────

export function SaleReturnList() {
  const router = useRouter();
  const { data, isLoading } = useSaleReturnList();

  const responseData = data?.data;
  const items: SaleReturn[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: SaleReturn[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenReturns(items), [items]);

  function handleRowEdit(row: Record<string, any>) {
    router.push(`/sales/returns/${row.id}`);
  }

  function handleCreate() {
    router.push('/sales/returns/new');
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Icon name="loader" size={24} className="animate-spin" /> Loading sale returns...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Sale Returns"
        columns={RETURN_COLUMNS}
        tableKey="sale-returns"
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />
    </div>
  );
}
