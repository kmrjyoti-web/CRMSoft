'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Badge, Button, Card, SelectInput, NumberInput } from '@/components/ui';
import { Icon } from '@/components/ui';

import {
  useSaleReturnDetail,
  useInspectReturn,
  useAcceptReturn,
  useRejectReturn,
} from '../hooks/useSales';
import type { SaleReturnItem } from '../types/sales.types';
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

// ── Status badge mapping ────────────────────────────────────

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  DRAFT: 'default',
  RECEIVED: 'warning',
  INSPECTED: 'primary',
  ACCEPTED: 'success',
  REJECTED: 'danger',
};

const CONDITION_OPTIONS = [
  { label: 'Good', value: 'GOOD' },
  { label: 'Damaged', value: 'DAMAGED' },
  { label: 'Expired', value: 'EXPIRED' },
];

// ── Helpers ─────────────────────────────────────────────────



// ── Item columns ────────────────────────────────────────────

const ITEM_COLUMNS = [
  { id: 'productId', label: 'Product' },
  { id: 'returnedQty', label: 'Returned Qty' },
  { id: 'acceptedQty', label: 'Accepted Qty' },
  { id: 'rejectedQty', label: 'Rejected Qty' },
  { id: 'condition', label: 'Condition' },
  { id: 'unitPrice', label: 'Unit Price' },
  { id: 'totalAmount', label: 'Total' },
];

// ── Inspection row state ────────────────────────────────────

interface InspectionRow {
  itemId: string;
  acceptedQty: number | null;
  rejectedQty: number | null;
  condition: string;
}

// ── Component ───────────────────────────────────────────────

interface SaleReturnDetailProps {
  id: string;
}

export function SaleReturnDetail({ id }: SaleReturnDetailProps) {
  const router = useRouter();
  const { data, isLoading } = useSaleReturnDetail(id);
  const inspectMutation = useInspectReturn();
  const acceptMutation = useAcceptReturn();
  const rejectMutation = useRejectReturn();

  const returnData = data?.data ?? data;

  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [inspectMode, setInspectMode] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6">
        <Icon name="loader" size={24} className="animate-spin" /> Loading...
      </div>
    );
  }

  if (!returnData) {
    return <div className="p-6">Sale Return not found.</div>;
  }

  const status = returnData.status as string;
  const items: SaleReturnItem[] = returnData.items ?? [];

  const itemRows = items.map((it: SaleReturnItem) => ({
    id: it.id,
    productId: it.productId,
    returnedQty: it.returnedQty,
    acceptedQty: it.acceptedQty ?? '\u2014',
    rejectedQty: it.rejectedQty ?? '\u2014',
    condition: it.condition || '\u2014',
    unitPrice: formatCurrency(it.unitPrice),
    totalAmount: formatCurrency(it.totalAmount),
  }));

  function startInspection() {
    setInspections(
      items.map((it) => ({
        itemId: it.id,
        acceptedQty: it.acceptedQty ?? null,
        rejectedQty: it.rejectedQty ?? null,
        condition: it.condition || 'GOOD',
      })),
    );
    setInspectMode(true);
  }

  function updateInspection(index: number, field: keyof InspectionRow, value: any) {
    setInspections((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  async function submitInspection() {
    await inspectMutation.mutateAsync({
      id,
      inspections: inspections.map((row) => ({
        itemId: row.itemId,
        acceptedQty: row.acceptedQty ?? 0,
        rejectedQty: row.rejectedQty ?? 0,
        condition: row.condition,
      })),
    });
    setInspectMode(false);
  }

  async function handleAccept() {
    await acceptMutation.mutateAsync(id);
  }

  async function handleReject() {
    await rejectMutation.mutateAsync(id);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <Icon name="arrow-left" size={20} />
          </Button>
          <h1 className="text-2xl font-semibold">{returnData.returnNumber}</h1>
          <Badge variant={STATUS_VARIANT[status] ?? 'default'}>{status}</Badge>
          {returnData.inventoryUpdated && (
            <Badge variant="success">
              <Icon name="check-circle" size={14} /> Stock Updated
            </Badge>
          )}
        </div>
      </div>

      {/* ── Info Card ── */}
      <Card>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Return Date</span>
            <p className="font-medium">{formatDate(returnData.returnDate)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Return Reason</span>
            <p className="font-medium">{returnData.returnReason}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Grand Total</span>
            <p className="font-medium">{formatCurrency(returnData.grandTotal)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Customer Type</span>
            <p className="font-medium">{returnData.customerType}</p>
          </div>
        </div>
      </Card>

      {/* ── Items Table ── */}
      <Card>
        <div className="p-4 space-y-3">
          <h2 className="text-lg font-medium">Return Items</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  {ITEM_COLUMNS.map((col) => (
                    <th key={col.id} style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#475569' }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itemRows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    {ITEM_COLUMNS.map((col) => (
                      <td key={col.id} style={{ padding: '10px 12px', fontSize: 14 }}>
                        {(row as any)[col.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* ── Inspection Section ── */}
      {(status === 'DRAFT' || status === 'RECEIVED') && !inspectMode && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={startInspection}>
            <Icon name="search" size={16} /> Inspect Items
          </Button>
        </div>
      )}

      {inspectMode && (
        <Card>
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-medium">Inspection</h2>
            {inspections.map((row, idx) => {
              const item = items[idx];
              return (
                <div
                  key={row.itemId}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end border-b pb-3"
                >
                  <div className="text-sm">
                    <span className="text-muted-foreground">Product</span>
                    <p className="font-medium">{item?.productId}</p>
                    <p className="text-xs text-muted-foreground">
                      Returned: {item?.returnedQty}
                    </p>
                  </div>
                  <NumberInput
                    label="Accepted Qty"
                    value={row.acceptedQty}
                    onChange={(v) => updateInspection(idx, 'acceptedQty', v)}
                  />
                  <NumberInput
                    label="Rejected Qty"
                    value={row.rejectedQty}
                    onChange={(v) => updateInspection(idx, 'rejectedQty', v)}
                  />
                  <SelectInput
                    label="Condition"
                    options={CONDITION_OPTIONS}
                    value={row.condition}
                    onChange={(v) => updateInspection(idx, 'condition', String(v))}
                  />
                </div>
              );
            })}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setInspectMode(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitInspection}
                disabled={inspectMutation.isPending}
              >
                {inspectMutation.isPending ? 'Submitting...' : 'Submit Inspection'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Accept / Reject Actions ── */}
      {status === 'INSPECTED' && (
        <div className="flex justify-end gap-3">
          <Button
            variant="primary"
            onClick={handleAccept}
            disabled={acceptMutation.isPending}
          >
            <Icon name="check" size={16} />{' '}
            {acceptMutation.isPending ? 'Accepting...' : 'Accept Return'}
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            <Icon name="x" size={16} />{' '}
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject Return'}
          </Button>
        </div>
      )}

      {/* ── Linked Credit Note ── */}
      {status === 'ACCEPTED' && returnData.creditNoteId && (
        <Card>
          <div className="p-4 flex items-center gap-3">
            <Icon name="file-text" size={20} />
            <span className="font-medium">Linked Credit Note:</span>
            <Badge variant="primary">{returnData.creditNoteId}</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
