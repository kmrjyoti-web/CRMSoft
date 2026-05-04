'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button, Input, Fieldset, Icon, TextareaInput } from '@/components/ui';
import { useSidePanelStore } from '@/stores/side-panel.store';
import { FormErrors } from '@/components/common/FormErrors';
import { FormSubmitOverlay } from '@/components/common/FormSubmitOverlay';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PageHeader } from '@/components/common/PageHeader';

import { usePackageDetail, useCreatePackage, useUpdatePackage } from '../hooks/useProducts';

// -- Schema -------------------------------------------------------------------

const packageSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  type: z.string().optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

// -- Props --------------------------------------------------------------------

interface PackageFormProps {
  packageId?: string;
  mode?: 'page' | 'panel';
  panelId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// -- Component ----------------------------------------------------------------

export function PackageForm({ packageId, mode = 'page', panelId, onSuccess, onCancel }: PackageFormProps) {
  const router = useRouter();
  const isEdit = !!packageId;
  const updatePanelConfig = useSidePanelStore((s) => s.updatePanelConfig);

  const { data: pkgData, isLoading: isLoadingPkg } = usePackageDetail(packageId ?? '');
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: { name: '', code: '', description: '', type: '' },
  });

  useEffect(() => {
    if (!isEdit || !pkgData?.data) return;
    const p = pkgData.data;
    reset({
      name: p.name,
      code: p.code,
      description: p.description ?? '',
      type: p.type ?? '',
    });
  }, [isEdit, pkgData, reset]);

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
            const form = document.getElementById(`sp-form-package-${packageId ?? 'new'}`) as HTMLFormElement | null;
            form?.requestSubmit();
          },
        },
      ],
    });
  }, [isSubmitting, panelId, isEdit, packageId, updatePanelConfig, onCancel]);

  const onSubmit = async (values: PackageFormValues) => {
    try {
      if (isEdit && packageId) {
        await updateMutation.mutateAsync({ id: packageId, data: values });
        toast.success('Package updated successfully');
        isPanel && onSuccess ? onSuccess() : router.push('/products/packages');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Package created successfully');
        isPanel && onSuccess ? onSuccess() : router.push('/products/packages');
      }
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} package`;
      toast.error(message);
    }
  };

  if (isEdit && isLoadingPkg) return <LoadingSpinner fullPage />;

  return (
    <div className={isPanel ? 'p-4' : 'p-6'} style={{ position: 'relative' }}>
      <FormSubmitOverlay isSubmitting={isSubmitting} isEdit={isEdit} />
      {!isPanel && (
        <PageHeader title={isEdit ? 'Edit Package' : 'New Package'} actions={<Button variant="outline" onClick={() => router.back()}>Back</Button>} />
      )}
      <FormErrors errors={errors} />
      <form
        id={isPanel ? `sp-form-package-${packageId ?? 'new'}` : undefined}
        onSubmit={(handleSubmit as any)(onSubmit)}
        noValidate
        className="mt-4 max-w-3xl space-y-6"
      >
        <Fieldset label="Package Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller name="name" control={control} render={({ field }) => (
              <Input label="Name" leftIcon={<Icon name="archive" size={16} />} placeholder="Package name" value={field.value} onChange={field.onChange} error={!!errors.name} errorMessage={errors.name?.message} />
            )} />
            <Controller name="code" control={control} render={({ field }) => (
              <Input label="Code" leftIcon={<Icon name="hash" size={16} />} placeholder="Package code" value={field.value} onChange={field.onChange} error={!!errors.code} errorMessage={errors.code?.message} />
            )} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller name="type" control={control} render={({ field }) => (
              <Input label="Type" leftIcon={<Icon name="layers" size={16} />} placeholder="e.g. BOX, STRIP, PACK" value={field.value ?? ''} onChange={field.onChange} />
            )} />
          </div>
          <div className="mt-4">
            <Controller name="description" control={control} render={({ field }) => (
              <TextareaInput label="Description" rows={3} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)} />
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
