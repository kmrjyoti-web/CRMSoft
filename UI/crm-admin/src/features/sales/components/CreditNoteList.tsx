'use client';

import { useMemo, useState } from 'react';

import { TableFull, Badge, Button, Card, Input, CheckboxInput } from '@/components/ui';
import { Icon } from '@/components/ui';

import {
  useCreditNoteList,
  useIssueCreditNote,
  useAdjustCreditNote,
} from '../hooks/useSales';
import type { SalesCreditNote } from '../types/sales.types';
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

// ── Column definitions ──────────────────────────────────────

const CN_COLUMNS = [
  { id: 'creditNoteNo', label: 'Credit Note No', visible: true },
  { id: 'invoiceId', label: 'Invoice', visible: true },
  { id: 'amount', label: 'Amount', visible: true },
  { id: 'reason', label: 'Reason', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'issuedAt', label: 'Issued At', visible: true },
  { id: 'appliedAmount', label: 'Applied Amount', visible: true },
];

// ── Status badge mapping ────────────────────────────────────

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  CN_DRAFT: 'default',
  CN_ISSUED: 'primary',
  CN_ADJUSTED: 'success',
  CN_CANCELLED: 'danger',
};

// ── Helpers ─────────────────────────────────────────────────



function flattenCreditNotes(items: SalesCreditNote[]): Record<string, unknown>[] {
  return items.map((cn) => ({
    id: cn.id,
    creditNoteNo: cn.creditNoteNo,
    invoiceId: cn.invoiceId,
    amount: formatCurrency(cn.amount),
    reason: cn.reason,
    status: cn.status,
    _statusBadge: (
      <Badge variant={STATUS_VARIANT[cn.status] ?? 'default'}>{cn.status}</Badge>
    ),
    issuedAt: formatDate(cn.issuedAt),
    appliedAmount: formatCurrency(cn.appliedAmount),
  }));
}

// ── Component ───────────────────────────────────────────────

export function CreditNoteList() {
  const { data, isLoading } = useCreditNoteList();
  const issueMutation = useIssueCreditNote();
  const adjustMutation = useAdjustCreditNote();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adjustInvoiceId, setAdjustInvoiceId] = useState('');
  const [issueRefund, setIssueRefund] = useState(false);

  const responseData = data?.data;
  const items: SalesCreditNote[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: SalesCreditNote[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenCreditNotes(items), [items]);

  function handleRowEdit(row: Record<string, any>) {
    setSelectedId((prev) => (prev === row.id ? null : row.id));
    setAdjustInvoiceId('');
    setIssueRefund(false);
  }

  async function handleIssue(id: string) {
    await issueMutation.mutateAsync(id);
    setSelectedId(null);
  }

  async function handleAdjust(id: string) {
    await adjustMutation.mutateAsync({
      id,
      data: {
        invoiceId: adjustInvoiceId || undefined,
        issueRefund,
      },
    });
    setSelectedId(null);
    setAdjustInvoiceId('');
    setIssueRefund(false);
  }

  const selectedNote = items.find((cn) => cn.id === selectedId);

  if (isLoading) {
    return (
      <div className="p-6">
        <Icon name="loader" size={24} className="animate-spin" /> Loading credit notes...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <TableFull
        data={tableData as Record<string, any>[]}
        title="Credit Notes"
        columns={CN_COLUMNS}
        tableKey="credit-notes"
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowEdit}
      />

      {/* ── Inline Actions Panel ── */}
      {selectedNote && (
        <Card>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium">{selectedNote.creditNoteNo}</h3>
              <Badge variant={STATUS_VARIANT[selectedNote.status] ?? 'default'}>
                {selectedNote.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amount</span>
                <p className="font-medium">{formatCurrency(selectedNote.amount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Reason</span>
                <p className="font-medium">{selectedNote.reason}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Invoice</span>
                <p className="font-medium">{selectedNote.invoiceId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Applied Amount</span>
                <p className="font-medium">{formatCurrency(selectedNote.appliedAmount)}</p>
              </div>
            </div>

            {/* Issue action for CN_DRAFT */}
            {selectedNote.status === 'CN_DRAFT' && (
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => handleIssue(selectedNote.id)}
                  disabled={issueMutation.isPending}
                >
                  <Icon name="send" size={16} />{' '}
                  {issueMutation.isPending ? 'Issuing...' : 'Issue Credit Note'}
                </Button>
              </div>
            )}

            {/* Adjust action for CN_ISSUED */}
            {selectedNote.status === 'CN_ISSUED' && (
              <div className="space-y-3">
                <h4 className="font-medium">Adjust Credit Note</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Invoice ID to Adjust Against"
                    leftIcon={<Icon name="file-text" size={16} />}
                    value={adjustInvoiceId}
                    onChange={(v: any) => setAdjustInvoiceId(typeof v === 'string' ? v : v?.target?.value ?? '')}
                  />
                  <div className="flex items-center">
                    <CheckboxInput
                      label="Issue Refund Instead"
                      checked={issueRefund}
                      onChange={(v: any) => setIssueRefund(typeof v === 'boolean' ? v : !!v)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedId(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleAdjust(selectedNote.id)}
                    disabled={adjustMutation.isPending}
                  >
                    {adjustMutation.isPending ? 'Adjusting...' : 'Adjust'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
