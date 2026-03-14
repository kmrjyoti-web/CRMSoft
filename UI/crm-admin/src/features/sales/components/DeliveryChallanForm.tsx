'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button, Card, Input, SelectInput, NumberInput } from '@/components/ui';
import { SmartDateInput } from '@/components/common/SmartDateInput';
import { Icon } from '@/components/ui';

import { useCreateDeliveryChallan } from '../hooks/useSales';
import type { CreateDeliveryChallanPayload } from '../types/sales.types';

// ── Item shape ──────────────────────────────────────────────

interface ChallanItemRow {
  productId: string;
  quantity: number | null;
  unitId: string;
  unitPrice: number | null;
  batchNo: string;
  fromLocationId: string;
}

const EMPTY_ITEM: ChallanItemRow = {
  productId: '',
  quantity: null,
  unitId: '',
  unitPrice: null,
  batchNo: '',
  fromLocationId: '',
};

const CUSTOMER_TYPE_OPTIONS = [
  { label: 'Organization', value: 'ORGANIZATION' },
  { label: 'Individual', value: 'INDIVIDUAL' },
];

// ── Component ───────────────────────────────────────────────

export function DeliveryChallanForm() {
  const router = useRouter();
  const createMutation = useCreateDeliveryChallan();

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<{
    saleOrderId: string;
    customerId: string;
    customerType: string;
    fromLocationId: string;
    transporterName: string;
    vehicleNumber: string;
    lrNumber: string;
    ewayBillNumber: string;
    ewayBillDate: string;
    remarks: string;
  }>({
    defaultValues: {
      saleOrderId: '',
      customerId: '',
      customerType: 'ORGANIZATION',
      fromLocationId: '',
      transporterName: '',
      vehicleNumber: '',
      lrNumber: '',
      ewayBillNumber: '',
      ewayBillDate: '',
      remarks: '',
    },
  });

  const [items, setItems] = useState<ChallanItemRow[]>([{ ...EMPTY_ITEM }]);

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ChallanItemRow, value: any) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  const onSubmit = handleSubmit(async (formData) => {
    const payload: CreateDeliveryChallanPayload = {
      saleOrderId: formData.saleOrderId || undefined,
      customerId: formData.customerId,
      customerType: formData.customerType,
      fromLocationId: formData.fromLocationId,
      transporterName: formData.transporterName || undefined,
      vehicleNumber: formData.vehicleNumber || undefined,
      lrNumber: formData.lrNumber || undefined,
      ewayBillNumber: formData.ewayBillNumber || undefined,
      ewayBillDate: formData.ewayBillDate || undefined,
      remarks: formData.remarks || undefined,
      items: items
        .filter((it) => it.productId && it.quantity)
        .map((it) => ({
          productId: it.productId,
          quantity: it.quantity ?? 0,
          unitId: it.unitId,
          unitPrice: it.unitPrice ?? undefined,
          batchNo: it.batchNo || undefined,
          fromLocationId: it.fromLocationId || undefined,
        })),
    };

    await createMutation.mutateAsync(payload);
    router.push('/sales/delivery-challans');
  }) as any;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">New Delivery Challan</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* ── Header Fields ── */}
        <Card>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Sale Order ID (optional)"
              leftIcon={<Icon name="file-text" size={16} />}
              value={watch('saleOrderId') ?? ''}
              onChange={(v: any) => setValue('saleOrderId', typeof v === 'string' ? v : v?.target?.value ?? '')}
            />
            <Input
              label="Customer ID"
              leftIcon={<Icon name="user" size={16} />}
              value={watch('customerId') ?? ''}
              onChange={(v: any) => setValue('customerId', typeof v === 'string' ? v : v?.target?.value ?? '')}
            />
            <SelectInput
              label="Customer Type"
              leftIcon={<Icon name="users" size={16} />}
              options={CUSTOMER_TYPE_OPTIONS}
              value={watch('customerType')}
              onChange={(v) => setValue('customerType', String(v))}
            />
            <Input
              label="From Location"
              leftIcon={<Icon name="map-pin" size={16} />}
              value={watch('fromLocationId') ?? ''}
              onChange={(v: any) => setValue('fromLocationId', typeof v === 'string' ? v : v?.target?.value ?? '')}
            />
          </div>
        </Card>

        {/* ── Transport Info ── */}
        <Card>
          <div className="p-4 space-y-2">
            <h2 className="text-lg font-medium">Transport Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Transporter Name"
                leftIcon={<Icon name="truck" size={16} />}
                value={watch('transporterName') ?? ''}
                onChange={(v: any) => setValue('transporterName', typeof v === 'string' ? v : v?.target?.value ?? '')}
              />
              <Input
                label="Vehicle Number"
                leftIcon={<Icon name="car" size={16} />}
                value={watch('vehicleNumber') ?? ''}
                onChange={(v: any) => setValue('vehicleNumber', typeof v === 'string' ? v : v?.target?.value ?? '')}
              />
              <Input
                label="LR Number"
                leftIcon={<Icon name="hash" size={16} />}
                value={watch('lrNumber') ?? ''}
                onChange={(v: any) => setValue('lrNumber', typeof v === 'string' ? v : v?.target?.value ?? '')}
              />
              <Input
                label="E-Way Bill Number"
                leftIcon={<Icon name="file-check" size={16} />}
                value={watch('ewayBillNumber') ?? ''}
                onChange={(v: any) => setValue('ewayBillNumber', typeof v === 'string' ? v : v?.target?.value ?? '')}
              />
              <SmartDateInput
                label="E-Way Bill Date"
                value={watch('ewayBillDate') || null}
                onChange={(v) => setValue('ewayBillDate', v ?? '')}
              />
              <Input
                label="Remarks"
                leftIcon={<Icon name="message-square" size={16} />}
                value={watch('remarks') ?? ''}
                onChange={(v: any) => setValue('remarks', typeof v === 'string' ? v : v?.target?.value ?? '')}
              />
            </div>
          </div>
        </Card>

        {/* ── Items ── */}
        <Card>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Items</h2>
              <Button variant="outline" type="button" onClick={addItem}>
                <Icon name="plus" size={16} /> Add Item
              </Button>
            </div>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end border-b pb-3"
              >
                <Input
                  label="Product ID"
                  leftIcon={<Icon name="package" size={16} />}
                  value={item.productId}
                  onChange={(v: any) => updateItem(idx, 'productId', typeof v === 'string' ? v : v?.target?.value ?? '')}
                />
                <NumberInput
                  label="Quantity"
                  value={item.quantity}
                  onChange={(v) => updateItem(idx, 'quantity', v)}
                />
                <Input
                  label="Unit ID"
                  value={item.unitId}
                  onChange={(v: any) => updateItem(idx, 'unitId', typeof v === 'string' ? v : v?.target?.value ?? '')}
                />
                <NumberInput
                  label="Unit Price"
                  value={item.unitPrice}
                  onChange={(v) => updateItem(idx, 'unitPrice', v)}
                />
                <Input
                  label="Batch No"
                  value={item.batchNo}
                  onChange={(v: any) => updateItem(idx, 'batchNo', typeof v === 'string' ? v : v?.target?.value ?? '')}
                />
                <div className="flex items-center gap-2">
                  <Input
                    label="Location"
                    value={item.fromLocationId}
                    onChange={(v: any) => updateItem(idx, 'fromLocationId', typeof v === 'string' ? v : v?.target?.value ?? '')}
                  />
                  {items.length > 1 && (
                    <Button variant="danger" type="button" onClick={() => removeItem(idx)}>
                      <Icon name="trash-2" size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Submit ── */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Delivery Challan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
