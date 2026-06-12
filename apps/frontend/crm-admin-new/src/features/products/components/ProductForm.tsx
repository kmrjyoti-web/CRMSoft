'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import {
  Button,
  Input,
  SelectInput,
  NumberInput,
  CurrencyInput,
  Icon,
} from '@/components/ui';
import { useSidePanelStore } from '@/stores/side-panel.store';
import { FormErrors } from '@/components/common/FormErrors';
import { FormSubmitOverlay } from '@/components/common/FormSubmitOverlay';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageHeader } from '@/components/common/PageHeader';
import { LookupSelect } from '@/components/common/LookupSelect';

import {
  useProductDetail,
  useCreateProduct,
  useUpdateProduct,
} from '../hooks/useProducts';

// -- Schema (only real DB-backed fields) -------------------------------------

const productSchema = z.object({
  name:             z.string().min(1, 'Name is required'),
  code:             z.string().optional(),
  inventoryType:    z.string().optional(),   // stored in configJson.inventoryType
  packingSize:      z.number().nullable().optional(),
  primaryUnit:      z.string().optional(),
  hsnCode:          z.string().optional(),
  gstRate:          z.number().nullable().optional(),
  barcode:          z.string().optional(),
  mrp:              z.number().nullable().optional(),
  purchasePrice:    z.number().nullable().optional(),
  costPrice:        z.number().nullable().optional(),
  salePrice:        z.number().nullable().optional(),
  // Advance — Discount
  discountApplicable: z.string().optional(),
  itemDisc1:          z.number().nullable().optional(),
  maxDisc:            z.number().nullable().optional(),
  // Advance — Quantity (map to minOrderQty / maxOrderQty)
  minOrderQty:      z.number().nullable().optional(),
  maxOrderQty:      z.number().nullable().optional(),
  reorderDays:      z.number().nullable().optional(),
  openingStock:     z.number().nullable().optional(),
  reorderQty:       z.number().nullable().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// -- Options ------------------------------------------------------------------

const UNIT_OPTIONS = [
  { value: 'PIECE',   label: 'Piece' },
  { value: 'BOX',     label: 'Box' },
  { value: 'PACK',    label: 'Pack' },
  { value: 'CARTON',  label: 'Carton' },
  { value: 'KG',      label: 'Kilogram' },
  { value: 'GRAM',    label: 'Gram' },
  { value: 'LITRE',   label: 'Litre' },
  { value: 'ML',      label: 'Millilitre' },
  { value: 'METER',   label: 'Meter' },
  { value: 'DOZEN',   label: 'Dozen' },
  { value: 'SET',     label: 'Set' },
  { value: 'PAIR',    label: 'Pair' },
  { value: 'TAB',     label: 'Tab' },
];

const DISCOUNT_OPTIONS = [
  { value: 'APPLICABLE',     label: 'Applicable' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
];


// -- Tab button --------------------------------------------------------------

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        fontSize: 13,
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        fontWeight: active ? 600 : 400,
        color: active ? '#111827' : '#6b7280',
        borderBottom: active ? '2px solid #374151' : '2px solid transparent',
      }}
    >
      {label}
    </button>
  );
}

// -- Props -------------------------------------------------------------------

interface ProductFormProps {
  productId?: string;
  mode?: 'page' | 'panel';
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// -- Component ---------------------------------------------------------------

export function ProductForm({
  productId,
  mode = 'page',
  panelId,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const [advanceEnabled, setAdvanceEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'discount' | 'quantity'>('discount');

  const { data: productData, isLoading: isLoadingProduct } = useProductDetail(productId ?? '');
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name:               '',
      code:               '',
      inventoryType:      'PRODUCT',
      packingSize:        null,
      primaryUnit:        'PIECE',
      hsnCode:            '',
      gstRate:            null,
      barcode:            '',
      mrp:                null,
      purchasePrice:      null,
      costPrice:          null,
      salePrice:          null,
      discountApplicable: 'APPLICABLE',
      itemDisc1:          null,
      maxDisc:            null,
      minOrderQty:        null,
      maxOrderQty:        null,
      reorderDays:        null,
      openingStock:       null,
      reorderQty:         null,
    },
  });

  useEffect(() => {
    if (!isEdit || !productData?.data) return;
    const p = productData.data as any;
    const cfg = p.configJson ?? {};
    reset({
      name:               p.name,
      code:               p.code ?? '',
      inventoryType:      cfg.inventoryType ?? 'PRODUCT',
      packingSize:        p.packingSize != null ? Number(p.packingSize) : null,
      primaryUnit:        p.primaryUnit ?? 'PIECE',
      hsnCode:            p.hsnCode ?? '',
      gstRate:            p.gstRate != null ? Number(p.gstRate) : null,
      barcode:            p.barcode ?? '',
      mrp:                p.mrp != null ? Number(p.mrp) : null,
      purchasePrice:      p.purchasePrice != null ? Number(p.purchasePrice) : null,
      costPrice:          p.costPrice != null ? Number(p.costPrice) : null,
      salePrice:          p.salePrice != null ? Number(p.salePrice) : null,
      discountApplicable: cfg.discountApplicable ?? 'APPLICABLE',
      itemDisc1:          cfg.itemDisc1 != null ? Number(cfg.itemDisc1) : null,
      maxDisc:            cfg.maxDisc   != null ? Number(cfg.maxDisc)   : null,
      minOrderQty:        p.minOrderQty != null ? Number(p.minOrderQty) : null,
      maxOrderQty:        p.maxOrderQty != null ? Number(p.maxOrderQty) : null,
      reorderDays:        cfg.reorderDays  != null ? Number(cfg.reorderDays)  : null,
      openingStock:       cfg.openingStock != null ? Number(cfg.openingStock) : null,
      reorderQty:         cfg.reorderQty  != null ? Number(cfg.reorderQty)   : null,
    });
  }, [isEdit, productData, reset]);

  const isPanel = mode === 'panel';

  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        {
          id: 'cancel', label: 'Cancel', showAs: 'text' as const,
          variant: 'secondary' as const, disabled: isSubmitting,
          onClick: () => onCancel?.(),
        },
        {
          id: 'save',
          label: isSubmitting
            ? isEdit ? 'Updating...' : 'Saving...'
            : isEdit ? 'Save Changes' : 'Save',
          icon: 'check', showAs: 'both' as const, variant: 'primary' as const,
          loading: isSubmitting, disabled: isSubmitting,
          onClick: () => {
            const f = document.getElementById(
              `sp-form-product-${productId ?? 'new'}`,
            ) as HTMLFormElement | null;
            f?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, productId, updatePanelConfig, onCancel]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const payload = {
        name:          values.name,
        code:          values.code || undefined,
        primaryUnit:   values.primaryUnit || undefined,
        hsnCode:       values.hsnCode || undefined,
        gstRate:       values.gstRate ?? undefined,
        barcode:       values.barcode || undefined,
        packingSize:   values.packingSize ?? undefined,
        mrp:           values.mrp ?? undefined,
        purchasePrice: values.purchasePrice ?? undefined,
        costPrice:     values.costPrice ?? undefined,
        salePrice:     values.salePrice ?? undefined,
        minOrderQty:   values.minOrderQty ?? undefined,
        maxOrderQty:   values.maxOrderQty ?? undefined,
        // non-DB fields packed into configJson
        configJson: {
          inventoryType:      values.inventoryType ?? 'PRODUCT',
          discountApplicable: values.discountApplicable ?? 'APPLICABLE',
          itemDisc1:          values.itemDisc1 ?? 0,
          maxDisc:            values.maxDisc   ?? 0,
          reorderDays:        values.reorderDays  ?? 0,
          openingStock:       values.openingStock ?? 0,
          reorderQty:         values.reorderQty  ?? 0,
        },
      };

      if (isEdit && productId) {
        await updateMutation.mutateAsync({ id: productId, data: payload });
        toast.success('Product updated successfully');
        isPanel && onSuccess ? onSuccess() : router.push('/products/products');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Product created successfully');
        isPanel && onSuccess ? onSuccess() : router.push('/products/products');
      }
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        `Failed to ${isEdit ? 'update' : 'create'} product`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingProduct) return <LoadingSpinner fullPage />;

  const border = '1px solid #e5e7eb';
  const col1 = { flex: '0 0 400px', border, borderRight: 'none', padding: '12px 16px', background: '#fff' } as React.CSSProperties;
  const col2 = { flex: '0 0 300px', border, borderRight: 'none', padding: '12px 16px', background: '#fff' } as React.CSSProperties;
  const col3 = { flex: 1, border, padding: '12px 16px', background: '#fff', minWidth: 280 } as React.CSSProperties;
  const colHeader = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #e5e7eb' } as React.CSSProperties;
  const gap = { marginBottom: 10 } as React.CSSProperties;

  return (
    <div style={{ position: 'relative' }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />

      {!isPanel && (
        <PageHeader
          title={isEdit ? 'Edit Item' : 'Create Item'}
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              <Icon name="arrow-left" size={14} /> Back
            </Button>
          }
        />
      )}

      <FormErrors errors={errors} />

      <form
        id={isPanel ? `sp-form-product-${productId ?? 'new'}` : undefined}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
      >
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>

          {/* ── COL 1 : Basic Info ── */}
          <div style={col1}>
            <div style={colHeader}>Basic Info</div>

            {/* Product name + Inventory Type side-by-side */}
            <div style={{ display: 'flex', gap: 8, ...gap }}>
              <div style={{ flex: 1 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <Input
                    label="Product Name *"
                    leftIcon={<Icon name="package" size={16} />}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                )} />
              </div>
              <div style={{ width: 120 }}>
                <Controller name="inventoryType" control={control} render={({ field }) => (
                  <SelectInput
                    label="Type"
                    value={field.value ?? 'PRODUCT'}
                    options={[
                      { value: 'PRODUCT', label: 'Goods' },
                      { value: 'SERVICE', label: 'Service' },
                    ]}
                    onChange={(v) => field.onChange(String(v ?? 'PRODUCT'))}
                  />
                )} />
              </div>
            </div>

            <div style={gap}>
              <Controller name="packingSize" control={control} render={({ field }) => (
                <NumberInput label="Packing" leftIcon={<Icon name="box" size={16} />} value={field.value ?? null} onChange={field.onChange} />
              )} />
            </div>

            <div style={gap}>
              <Controller name="primaryUnit" control={control} render={({ field }) => (
                <SelectInput
                  label="Unit *"
                  leftIcon={<Icon name="layers" size={16} />}
                  options={UNIT_OPTIONS}
                  value={field.value ?? 'PIECE'}
                  onChange={(v) => field.onChange(String(v ?? 'PIECE'))}
                />
              )} />
            </div>

            <div style={gap}>
              <Controller name="hsnCode" control={control} render={({ field }) => (
                <Input
                  label="HSN / SAC *"
                  leftIcon={<Icon name="search" size={16} />}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )} />
            </div>

            <div style={gap}>
              <Controller name="gstRate" control={control} render={({ field }) => (
                <SelectInput
                  label="Tax Category *"
                  leftIcon={<Icon name="percent" size={16} />}
                  value={field.value != null ? String(field.value) : ''}
                  options={[
                    { value: '',   label: 'Select Tax Category' },
                    { value: '0',  label: 'GST 0%' },
                    { value: '5',  label: 'GST 5%' },
                    { value: '12', label: 'GST 12%' },
                    { value: '18', label: 'GST 18%' },
                    { value: '28', label: 'GST 28%' },
                  ]}
                  onChange={(v) => field.onChange(v !== '' && v != null ? Number(v) : null)}
                />
              )} />
            </div>

            <div style={gap}>
              <Controller name="barcode" control={control} render={({ field }) => (
                <Input
                  label="Barcode"
                  leftIcon={<Icon name="maximize" size={16} />}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )} />
            </div>

            <div style={gap}>
              <Controller name="code" control={control} render={({ field }) => (
                <Input
                  label="SKU Code"
                  leftIcon={<Icon name="hash" size={16} />}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )} />
            </div>
          </div>

          {/* ── COL 2 : Pricing ── */}
          <div style={col2}>
            <div style={colHeader}>&nbsp;</div>

            <div style={gap}>
              <Controller name="mrp" control={control} render={({ field }) => (
                <CurrencyInput label="M.R.P" value={field.value ?? null} onChange={field.onChange} />
              )} />
            </div>

            <div style={gap}>
              <Controller name="purchasePrice" control={control} render={({ field }) => (
                <CurrencyInput label="Purchase Rate" value={field.value ?? null} onChange={field.onChange} />
              )} />
            </div>

            <div style={gap}>
              <Controller name="costPrice" control={control} render={({ field }) => (
                <CurrencyInput label="Cost" value={field.value ?? null} onChange={field.onChange} />
              )} />
            </div>

            <div style={gap}>
              <Controller name="salePrice" control={control} render={({ field }) => (
                <CurrencyInput label="Sale Rate" value={field.value ?? null} onChange={field.onChange} />
              )} />
            </div>
          </div>

          {/* ── COL 3 : Advance Info ── */}
          <div style={col3}>
            {/* toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input
                type="checkbox"
                id="adv-toggle"
                checked={advanceEnabled}
                onChange={(e) => setAdvanceEnabled(e.target.checked)}
                style={{ width: 14, height: 14, cursor: 'pointer' }}
              />
              <label htmlFor="adv-toggle" style={{ fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                Advance Info
              </label>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 14 }}>
              <TabBtn label="Discount" active={activeTab === 'discount'} onClick={() => setActiveTab('discount')} />
              <TabBtn label="Quantity" active={activeTab === 'quantity'} onClick={() => setActiveTab('quantity')} />
            </div>

            {/* Discount Tab */}
            {activeTab === 'discount' && (
              <div>
                <div style={gap}>
                  <Controller name="discountApplicable" control={control} render={({ field }) => (
                    <SelectInput
                      label="Discount"
                      leftIcon={<Icon name="tag" size={16} />}
                      value={field.value ?? 'APPLICABLE'}
                      options={DISCOUNT_OPTIONS}
                      onChange={(v) => field.onChange(String(v ?? 'APPLICABLE'))}
                    />
                  )} />
                </div>
                <div style={gap}>
                  <Controller name="itemDisc1" control={control} render={({ field }) => (
                    <NumberInput label="Item Disc 1 %" leftIcon={<Icon name="percent" size={16} />} value={field.value ?? null} onChange={field.onChange} min={0} />
                  )} />
                </div>
                <div style={gap}>
                  <Controller name="maxDisc" control={control} render={({ field }) => (
                    <NumberInput label="Max Disc %" leftIcon={<Icon name="percent" size={16} />} value={field.value ?? null} onChange={field.onChange} min={0} />
                  )} />
                </div>
              </div>
            )}

            {/* Quantity Tab */}
            {activeTab === 'quantity' && (
              <div>
                <div style={gap}>
                  <Controller name="minOrderQty" control={control} render={({ field }) => (
                    <NumberInput label="Min. Quantity" leftIcon={<Icon name="arrow-down" size={16} />} value={field.value ?? null} onChange={field.onChange} min={0} />
                  )} />
                </div>
                <div style={gap}>
                  <Controller name="maxOrderQty" control={control} render={({ field }) => (
                    <NumberInput label="Max. Quantity" leftIcon={<Icon name="arrow-up" size={16} />} value={field.value ?? null} onChange={field.onChange} min={0} />
                  )} />
                </div>
                <div style={gap}>
                  <Controller name="reorderDays" control={control} render={({ field }) => (
                    <NumberInput label="Reorder Days" leftIcon={<Icon name="calendar" size={16} />} value={field.value ?? null} onChange={field.onChange} min={0} />
                  )} />
                </div>
                <div style={gap}>
                  <Controller name="openingStock" control={control} render={({ field }) => (
                    <NumberInput label="Item Opening" leftIcon={<Icon name="package" size={16} />} value={field.value ?? null} onChange={field.onChange} min={0} />
                  )} />
                </div>
                <div style={gap}>
                  <Controller name="reorderQty" control={control} render={({ field }) => (
                    <NumberInput label="Reorder Qty" leftIcon={<Icon name="refresh-cw" size={16} />} value={field.value ?? null} onChange={field.onChange} min={0} />
                  )} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page-mode buttons */}
        {!isPanel && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Update' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        )}
      </form>
    </div>
  );
}
