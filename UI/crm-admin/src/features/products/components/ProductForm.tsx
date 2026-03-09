'use client';

import { useEffect } from 'react';
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
  Fieldset,
  Icon,
  TagsInput,
} from '@/components/ui';
import { useSidePanelStore } from '@/stores/side-panel.store';
import { FormErrors } from '@/components/common/FormErrors';
import { FormSubmitOverlay } from '@/components/common/FormSubmitOverlay';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageHeader } from '@/components/common/PageHeader';

import {
  useProductDetail,
  useCreateProduct,
  useUpdateProduct,
} from '../hooks/useProducts';

// -- Schema -------------------------------------------------------------------

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  mrp: z.number().nullable().optional(),
  salePrice: z.number().nullable().optional(),
  purchasePrice: z.number().nullable().optional(),
  costPrice: z.number().nullable().optional(),
  hsnCode: z.string().optional(),
  gstRate: z.number().nullable().optional(),
  primaryUnit: z.string().optional(),
  barcode: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// -- Static options -----------------------------------------------------------

const UNIT_OPTIONS = [
  { value: 'PIECE', label: 'Piece' },
  { value: 'BOX', label: 'Box' },
  { value: 'PACK', label: 'Pack' },
  { value: 'CARTON', label: 'Carton' },
  { value: 'KG', label: 'Kilogram' },
  { value: 'GRAM', label: 'Gram' },
  { value: 'LITRE', label: 'Litre' },
  { value: 'ML', label: 'Millilitre' },
  { value: 'METER', label: 'Meter' },
  { value: 'DOZEN', label: 'Dozen' },
  { value: 'SET', label: 'Set' },
  { value: 'PAIR', label: 'Pair' },
];

// -- Props --------------------------------------------------------------------

interface ProductFormProps {
  productId?: string;
  mode?: 'page' | 'panel';
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// -- Component ----------------------------------------------------------------

export function ProductForm({ productId, mode = 'page', panelId, onSuccess, onCancel }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

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
      name: '',
      code: '',
      shortDescription: '',
      description: '',
      mrp: null,
      salePrice: null,
      purchasePrice: null,
      costPrice: null,
      hsnCode: '',
      gstRate: null,
      primaryUnit: 'PIECE',
      barcode: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (!isEdit || !productData?.data) return;
    const p = productData.data;
    reset({
      name: p.name,
      code: p.code ?? '',
      shortDescription: (p as any).shortDescription ?? '',
      description: (p as any).description ?? '',
      mrp: p.mrp != null ? Number(p.mrp) : null,
      salePrice: p.salePrice != null ? Number(p.salePrice) : null,
      purchasePrice: (p as any).purchasePrice != null ? Number((p as any).purchasePrice) : null,
      costPrice: (p as any).costPrice != null ? Number((p as any).costPrice) : null,
      hsnCode: p.hsnCode ?? '',
      gstRate: (p as any).gstRate != null ? Number((p as any).gstRate) : null,
      primaryUnit: p.primaryUnit ?? 'PIECE',
      barcode: (p as any).barcode ?? '',
      tags: p.tags ?? [],
    });
  }, [isEdit, productData, reset]);

  const isPanel = mode === 'panel';

  useEffect(() => {
    if (!panelId) return;
    updatePanelConfig(panelId, {
      footerButtons: [
        { id: 'cancel', label: 'Cancel', showAs: 'text' as const, variant: 'secondary' as const, disabled: isSubmitting, onClick: () => onCancel?.() },
        {
          id: 'save',
          label: isSubmitting ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Save Changes' : 'Save',
          icon: 'check', showAs: 'both' as const, variant: 'primary' as const,
          loading: isSubmitting, disabled: isSubmitting,
          onClick: () => {
            const form = document.getElementById(`sp-form-product-${productId ?? 'new'}`) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, productId, updatePanelConfig, onCancel]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const payload = {
        name: values.name,
        code: values.code || undefined,
        shortDescription: values.shortDescription || undefined,
        description: values.description || undefined,
        mrp: values.mrp ?? undefined,
        salePrice: values.salePrice ?? undefined,
        purchasePrice: values.purchasePrice ?? undefined,
        costPrice: values.costPrice ?? undefined,
        hsnCode: values.hsnCode || undefined,
        gstRate: values.gstRate ?? undefined,
        primaryUnit: values.primaryUnit || undefined,
        barcode: values.barcode || undefined,
        tags: values.tags,
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
      const message = (err as any)?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingProduct) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? 'p-4' : 'p-6'} style={{ position: 'relative' }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader title={isEdit ? 'Edit Product' : 'New Product'} actions={<Button variant="outline" onClick={() => router.back()}>Back</Button>} />
      )}
      <FormErrors errors={errors} />
      <form
        id={isPanel ? `sp-form-product-${productId ?? 'new'}` : undefined}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        {/* Basic Information */}
        <Fieldset label="Product Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller name="name" control={control} render={({ field }) => (
              <Input label="Name" leftIcon={<Icon name="package" size={16} />} placeholder="Product name" value={field.value} onChange={field.onChange} error={!!errors.name} errorMessage={errors.name?.message} />
            )} />
            <Controller name="code" control={control} render={({ field }) => (
              <Input label="SKU / Code" leftIcon={<Icon name="hash" size={16} />} placeholder="Product code" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </div>
          <div className="mt-4">
            <Controller name="shortDescription" control={control} render={({ field }) => (
              <Input label="Short Description" leftIcon={<Icon name="align-left" size={16} />} placeholder="Short description" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </div>
          <div className="mt-4">
            <Controller name="description" control={control} render={({ field }) => (
              <textarea className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none" rows={3} placeholder="Full description" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
            )} />
          </div>
        </Fieldset>

        {/* Pricing */}
        <Fieldset label="Pricing">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Controller name="mrp" control={control} render={({ field }) => (
              <CurrencyInput label="MRP" value={field.value ?? null} onChange={field.onChange} />
            )} />
            <Controller name="salePrice" control={control} render={({ field }) => (
              <CurrencyInput label="Sale Price" value={field.value ?? null} onChange={field.onChange} />
            )} />
            <Controller name="purchasePrice" control={control} render={({ field }) => (
              <CurrencyInput label="Purchase Price" value={field.value ?? null} onChange={field.onChange} />
            )} />
            <Controller name="costPrice" control={control} render={({ field }) => (
              <CurrencyInput label="Cost Price" value={field.value ?? null} onChange={field.onChange} />
            )} />
          </div>
        </Fieldset>

        {/* Tax & Unit */}
        <Fieldset label="Tax & Unit">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller name="hsnCode" control={control} render={({ field }) => (
              <Input label="HSN Code" leftIcon={<Icon name="file-text" size={16} />} placeholder="e.g. 84713010" value={field.value ?? ''} onChange={field.onChange} />
            )} />
            <Controller name="gstRate" control={control} render={({ field }) => (
              <NumberInput label="GST Rate (%)" value={field.value ?? null} onChange={field.onChange} min={0} max={100} />
            )} />
            <Controller name="primaryUnit" control={control} render={({ field }) => (
              <SelectInput label="Primary Unit" leftIcon={<Icon name="layers" size={16} />} options={UNIT_OPTIONS} value={field.value ?? 'PIECE'} onChange={field.onChange} />
            )} />
          </div>
        </Fieldset>

        {/* Barcode & Tags */}
        <Fieldset label="Additional">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller name="barcode" control={control} render={({ field }) => (
              <Input label="Barcode" leftIcon={<Icon name="maximize" size={16} />} placeholder="Barcode" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </div>
          <div className="mt-4">
            <Controller name="tags" control={control} render={({ field }) => (
              <TagsInput label="Tags" value={field.value ?? []} onChange={field.onChange} />
            )} />
          </div>
        </Fieldset>

        {!isPanel && (
          <div className="flex gap-3 pt-2">
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
