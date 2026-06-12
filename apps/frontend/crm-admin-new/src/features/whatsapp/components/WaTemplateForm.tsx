'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, SelectInput, Icon, TextareaInput } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  useWaTemplateDetail,
  useCreateWaTemplate,
  useUpdateWaTemplate,
} from '../hooks/useWaTemplates';
import { WaTemplatePreview } from './WaTemplatePreview';
import { WaTemplateButtonEditor, type TemplateButton } from './WaTemplateButtonEditor';
import { WaTemplateVariableEditor } from './WaTemplateVariableEditor';

const templateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .regex(/^[a-z][a-z0-9_]*$/, 'Lowercase letters, numbers, underscores only'),
  category: z.enum(['UTILITY', 'AUTHENTICATION', 'MARKETING']),
  language: z.string().min(1, 'Language is required'),
  headerType: z.enum(['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']).default('NONE'),
  headerContent: z.string().optional(),
  body: z.string().min(1, 'Body is required').max(1024, 'Max 1024 characters'),
  footer: z.string().max(60, 'Max 60 characters').optional(),
});

type FormValues = z.infer<typeof templateSchema>;

interface WaTemplateFormProps {
  templateId?: string;
}

export function WaTemplateForm({ templateId }: WaTemplateFormProps) {
  const router = useRouter();
  const isEdit = !!templateId;
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [variables, setVariables] = useState<{ key: string; sampleValue: string }[]>([]);

  const { data: detail, isLoading: detailLoading } = useWaTemplateDetail(templateId ?? '');
  const createMut = useCreateWaTemplate();
  const updateMut = useUpdateWaTemplate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(templateSchema) as any,
    defaultValues: {
      name: '',
      category: 'UTILITY',
      language: 'en',
      headerType: 'NONE',
      headerContent: '',
      body: '',
      footer: '',
    },
  });

  // Populate form in edit mode
  useEffect(() => {
    if (isEdit && detail?.data) {
      const d = detail.data;
      reset({
        name: d.name ?? '',
        category: d.category ?? 'UTILITY',
        language: d.language ?? 'en',
        headerType: d.headerType ?? 'NONE',
        headerContent: d.headerContent ?? '',
        body: d.body ?? '',
        footer: d.footer ?? '',
      });
      if (d.buttons) setButtons(d.buttons as TemplateButton[]);
    }
  }, [isEdit, detail, reset]);

  const headerType = watch('headerType');
  const body = watch('body');
  const headerContent = watch('headerContent');
  const footer = watch('footer');

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      buttons: buttons.length > 0 ? buttons : undefined,
      variables: variables.length > 0 ? variables : undefined,
    };

    if (isEdit && templateId) {
      updateMut.mutate(
        { id: templateId, data: payload },
        { onSuccess: () => router.push('/whatsapp/templates') },
      );
    } else {
      createMut.mutate(payload as any, {
        onSuccess: () => router.push('/whatsapp/templates'),
      });
    }
  };

  if (isEdit && detailLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Template' : 'Create Template'}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push('/whatsapp/templates')}>
            Back to Templates
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit) as any}>
          <div className="rounded-lg border border-gray-200 bg-white p-6" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
              Basic Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Input
                  label="Template Name"
                  {...register('name')}
                  value={watch('name')}
                  onChange={(v) => setValue('name', v)}
                  leftIcon={<Icon name="file-text" size={16} />}
                  disabled={isEdit}
                />
                {errors.name && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.name.message}</p>
                )}
              </div>
              <SelectInput
                label="Category"
                value={watch('category')}
                onChange={(v) => setValue('category', v as FormValues['category'])}
                options={[
                  { value: 'UTILITY', label: 'Utility' },
                  { value: 'AUTHENTICATION', label: 'Authentication' },
                  { value: 'MARKETING', label: 'Marketing' },
                ]}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <SelectInput
                label="Language"
                value={watch('language')}
                onChange={(v) => setValue('language', v as string)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'en_US', label: 'English (US)' },
                  { value: 'hi', label: 'Hindi' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'ar', label: 'Arabic' },
                ]}
              />
            </div>
          </div>

          {/* Header */}
          <div className="rounded-lg border border-gray-200 bg-white p-6" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
              Header
            </h3>
            <SelectInput
              label="Header Type"
              value={headerType}
              onChange={(v) => setValue('headerType', v as FormValues['headerType'])}
              options={[
                { value: 'NONE', label: 'None' },
                { value: 'TEXT', label: 'Text' },
                { value: 'IMAGE', label: 'Image' },
                { value: 'VIDEO', label: 'Video' },
                { value: 'DOCUMENT', label: 'Document' },
              ]}
            />
            {headerType === 'TEXT' && (
              <div style={{ marginTop: 12 }}>
                <Input
                  label="Header Text"
                  {...register('headerContent')}
                  value={watch('headerContent') ?? ''}
                  onChange={(v) => setValue('headerContent', v)}
                  leftIcon={<Icon name="type" size={16} />}
                />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="rounded-lg border border-gray-200 bg-white p-6" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
              Body
            </h3>
            <div>
              <TextareaInput
                label="Body"
                value={watch('body')}
                onChange={(e) => setValue('body', e.target.value)}
                rows={5}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.body && (
                  <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.body.message}</p>
                )}
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>
                  {(body ?? '').length}/1024
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="rounded-lg border border-gray-200 bg-white p-6" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
              Footer
            </h3>
            <Input
              label="Footer Text (optional)"
              {...register('footer')}
              value={watch('footer') ?? ''}
              onChange={(v) => setValue('footer', v)}
              leftIcon={<Icon name="type" size={16} />}
            />
            {errors.footer && (
              <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.footer.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="rounded-lg border border-gray-200 bg-white p-6" style={{ marginBottom: 16 }}>
            <WaTemplateButtonEditor buttons={buttons} onChange={setButtons} />
          </div>

          {/* Variables */}
          <div className="rounded-lg border border-gray-200 bg-white p-6" style={{ marginBottom: 16 }}>
            <WaTemplateVariableEditor body={body ?? ''} variables={variables} onChange={setVariables} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => router.push('/whatsapp/templates')}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending
                ? 'Saving...'
                : isEdit
                  ? 'Update Template'
                  : 'Create Template'}
            </Button>
          </div>
        </form>

        {/* Preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <WaTemplatePreview
            headerType={headerType}
            headerContent={headerContent}
            body={body}
            footer={footer}
            buttons={buttons}
          />
        </div>
      </div>
    </div>
  );
}
