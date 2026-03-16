'use client';

import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { TableFull, Badge } from '@/components/ui';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api-client';

// ── Types ─────────────────────────────────────────────────────────────

interface ProformaInvoice {
  id: string;
  proformaNumber: string;
  quotationId?: string;
  customerId: string;
  customerType: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  issueDate: string;
  validUntil?: string;
  subtotal: number;
  discountAmount?: number;
  taxableAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  grandTotal: number;
  notes?: string;
  termsConditions?: string;
  createdById: string;
  createdAt: string;
}

// ── Service ───────────────────────────────────────────────────────────

const proformaService = {
  list: () => apiClient.get<any>('/api/v1/sales/proforma').then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/api/v1/sales/proforma/${id}`).then((r) => r.data),
};

// ── Hooks ─────────────────────────────────────────────────────────────

function useProformaList() {
  return useQuery({ queryKey: ['proforma-invoices'], queryFn: proformaService.list });
}

function useDeleteProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: proformaService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proforma-invoices'] }),
  });
}

// ── Columns ───────────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'proformaNumber', label: 'Proforma #',    visible: true },
  { id: 'customerId',     label: 'Customer',       visible: true },
  { id: 'issueDate',      label: 'Issue Date',     visible: true },
  { id: 'validUntil',     label: 'Valid Until',    visible: true },
  { id: 'grandTotal',     label: 'Grand Total',    visible: true },
  { id: 'status',         label: 'Status',         visible: true },
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'secondary' | 'primary'> = {
  DRAFT: 'secondary', SENT: 'primary', ACCEPTED: 'success',
  REJECTED: 'danger', EXPIRED: 'warning', CONVERTED: 'success',
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// ── Component ─────────────────────────────────────────────────────────

export function ProformaList() {
  const { data, isLoading } = useProformaList();
  const deleteMut = useDeleteProforma();

  if (isLoading) return <TableSkeleton columns={6} rows={8} title="Proforma Invoices" />;

  const items: ProformaInvoice[] = useMemo(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const rows = useMemo(() => items.map((p) => ({
    id: p.id,
    _raw: p,
    proformaNumber: <span style={{ fontWeight: 600 }}>{p.proformaNumber}</span>,
    customerId:     p.customerId,
    issueDate:      new Date(p.issueDate).toLocaleDateString('en-IN'),
    validUntil:     p.validUntil ? new Date(p.validUntil).toLocaleDateString('en-IN') : '—',
    grandTotal:     <span style={{ fontWeight: 600, color: '#2563eb' }}>{fmt(p.grandTotal)}</span>,
    status:         <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>{p.status}</Badge>,
  })), [items]);

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete proforma "${row._raw.proformaNumber}"?`)) return;
    try {
      await deleteMut.mutateAsync(row.id);
      toast.success('Proforma invoice deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <TableFull
      data={rows}
      title="Proforma Invoices"
      tableKey="proforma-invoices"
      columns={COLUMNS}
      defaultViewMode="table"
      defaultDensity="compact"
      onRowEdit={() => { toast('Edit — coming soon'); }}
      onRowDelete={handleDelete}
      onCreate={() => { toast('Create — coming soon'); }}
    />
  );
}
