'use client';

import { useMemo, useState } from 'react';

import { TableFull, Badge, Button, Card, Input, NumberInput } from '@/components/ui';
import { Icon } from '@/components/ui';

import {
  useDebitNoteList,
  useCreateDebitNote,
  useIssueDebitNote,
} from '../hooks/useSales';
import type { DebitNote, CreateDebitNotePayload } from '../types/sales.types';
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

// ── Column definitions ──────────────────────────────────────

const DN_COLUMNS = [
  { id: 'debitNoteNumber', label: 'Debit Note No', visible: true },
  { id: 'vendorId', label: 'Vendor', visible: true },
  { id: 'reason', label: 'Reason', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'noteDate', label: 'Note Date', visible: true },
  { id: 'grandTotal', label: 'Grand Total', visible: true },
  { id: 'inventoryEffect', label: 'Inventory Effect', visible: true },
  { id: 'accountsEffect', label: 'Accounts Effect', visible: true },
];

// ── Status badge mapping ────────────────────────────────────

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  DRAFT: 'default',
  ISSUED: 'primary',
  ADJUSTED: 'success',
  CANCELLED: 'danger',
};

// ── Helpers ─────────────────────────────────────────────────



function flattenDebitNotes(items: DebitNote[]): Record<string, unknown>[] {
  return items.map((dn) => ({
    id: dn.id,
    debitNoteNumber: dn.debitNoteNumber,
    vendorId: dn.vendorId,
    reason: dn.reason,
    status: dn.status,
    _statusBadge: (
      <Badge variant={STATUS_VARIANT[dn.status] ?? 'default'}>{dn.status}</Badge>
    ),
    noteDate: formatDate(dn.noteDate),
    grandTotal: formatCurrency(dn.grandTotal),
    inventoryEffect: dn.inventoryEffect ? 'Yes' : 'No',
    accountsEffect: dn.accountsEffect ? 'Yes' : 'No',
  }));
}

// ── Create form item shape ──────────────────────────────────

interface FormItemRow {
  productId: string;
  quantity: number | null;
  unitId: string;
  unitPrice: number | null;
  taxableAmount: number | null;
  cgstAmount: number | null;
  sgstAmount: number | null;
  igstAmount: number | null;
  hsnCode: string;
}

const EMPTY_ITEM: FormItemRow = {
  productId: '',
  quantity: null,
  unitId: '',
  unitPrice: null,
  taxableAmount: null,
  cgstAmount: null,
  sgstAmount: null,
  igstAmount: null,
  hsnCode: '',
};

// ── Component ───────────────────────────────────────────────

export function DebitNoteList() {
  const { data, isLoading } = useDebitNoteList();
  const createMutation = useCreateDebitNote();
  const issueMutation = useIssueDebitNote();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [purchaseInvoiceId, setPurchaseInvoiceId] = useState('');
  const [reason, setReason] = useState('');
  const [formItems, setFormItems] = useState<FormItemRow[]>([{ ...EMPTY_ITEM }]);

  const responseData = data?.data;
  const items: DebitNote[] = useMemo(() => {
    if (Array.isArray(responseData)) return responseData;
    const nested = responseData as unknown as { data?: DebitNote[] };
    return nested?.data ?? [];
  }, [responseData]);

  const tableData = useMemo(() => flattenDebitNotes(items), [items]);

  function handleRowEdit(row: Record<string, unknown>) {
    const note = items.find((dn) => dn.id === row.id);
    if (note && note.status === 'DRAFT') {
      handleIssue(note.id);
    }
  }

  function handleCreate() {
    setShowCreateForm(true);
  }

  async function handleIssue(id: string) {
    await issueMutation.mutateAsync(id);
  }

  function addFormItem() {
    setFormItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeFormItem(index: number) {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFormItem(index: number, field: keyof FormItemRow, value: any) {
    setFormItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  async function submitCreate() {
    const payload: CreateDebitNotePayload = {
      vendorId,
      purchaseInvoiceId: purchaseInvoiceId || undefined,
      reason,
      items: formItems
        .filter((it) => it.productId && it.quantity)
        .map((it) => ({
          productId: it.productId,
          quantity: it.quantity ?? 0,
          unitId: it.unitId,
          unitPrice: it.unitPrice ?? 0,
          taxableAmount: it.taxableAmount ?? 0,
          cgstAmount: it.cgstAmount ?? undefined,
          sgstAmount: it.sgstAmount ?? undefined,
          igstAmount: it.igstAmount ?? undefined,
          hsnCode: it.hsnCode || undefined,
        })),
    };

    await createMutation.mutateAsync(payload);
    setShowCreateForm(false);
    setVendorId('');
    setPurchaseInvoiceId('');
    setReason('');
    setFormItems([{ ...EMPTY_ITEM }]);
  }

  function cancelCreate() {
    setShowCreateForm(false);
    setVendorId('');
    setPurchaseInvoiceId('');
    setReason('');
    setFormItems([{ ...EMPTY_ITEM }]);
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Icon name="loader" size={24} className="animate-spin" /> Loading debit notes...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <TableFull
        data={tableData as Record<string, unknown>[]}
        title="Debit Notes"
        columns={DN_COLUMNS}
        tableKey="debit-notes"
        defaultViewMode="table"
        defaultDensity="compact"
        onRowEdit={handleRowEdit}
        onCreate={handleCreate}
      />

      {/* ── Inline Create Form ── */}
      {showCreateForm && (
        <Card>
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-medium">New Debit Note</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Vendor ID"
                leftIcon={<Icon name="building" size={16} />}
                value={vendorId}
                onChange={(v: any) => setVendorId(typeof v === 'string' ? v : v?.target?.value ?? '')}
              />
              <Input
                label="Purchase Invoice ID"
                leftIcon={<Icon name="file-text" size={16} />}
                value={purchaseInvoiceId}
                onChange={(v: any) => setPurchaseInvoiceId(typeof v === 'string' ? v : v?.target?.value ?? '')}
              />
              <Input
                label="Reason"
                leftIcon={<Icon name="message-square" size={16} />}
                value={reason}
                onChange={(v: any) => setReason(typeof v === 'string' ? v : v?.target?.value ?? '')}
              />
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Items</h4>
                <Button variant="outline" type="button" onClick={addFormItem}>
                  <Icon name="plus" size={16} /> Add Item
                </Button>
              </div>

              {formItems.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end border-b pb-3"
                >
                  <Input
                    label="Product ID"
                    leftIcon={<Icon name="package" size={16} />}
                    value={item.productId}
                    onChange={(v: any) => updateFormItem(idx, 'productId', typeof v === 'string' ? v : v?.target?.value ?? '')}
                  />
                  <NumberInput
                    label="Quantity"
                    value={item.quantity}
                    onChange={(v) => updateFormItem(idx, 'quantity', v)}
                  />
                  <NumberInput
                    label="Unit Price"
                    value={item.unitPrice}
                    onChange={(v) => updateFormItem(idx, 'unitPrice', v)}
                  />
                  <NumberInput
                    label="Tax Amount"
                    value={item.taxableAmount}
                    onChange={(v) => updateFormItem(idx, 'taxableAmount', v)}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      label="HSN Code"
                      value={item.hsnCode}
                      onChange={(v: any) => updateFormItem(idx, 'hsnCode', typeof v === 'string' ? v : v?.target?.value ?? '')}
                    />
                    {formItems.length > 1 && (
                      <Button
                        variant="danger"
                        type="button"
                        onClick={() => removeFormItem(idx)}
                      >
                        <Icon name="trash-2" size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelCreate}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={submitCreate}
                disabled={createMutation.isPending || !vendorId || !reason}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Debit Note'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
