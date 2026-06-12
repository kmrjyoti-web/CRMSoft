'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  Plus,
  Trash2,
  Code,
  Paintbrush,
  Settings,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { useCreateTemplate } from '@/hooks/use-document-templates';
import { cn } from '@/lib/utils';
import type { CreateDocumentTemplateDto } from '@/types/document-template';

// ─── Constants ───

const STEPS = ['Basic Info', 'HTML Template', 'CSS Styles', 'Settings & Fields', 'Review'];

const DOCUMENT_TYPES = [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'QUOTATION', label: 'Quotation' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
  { value: 'DELIVERY_NOTE', label: 'Delivery Note' },
  { value: 'CREDIT_NOTE', label: 'Credit Note' },
  { value: 'PROFORMA', label: 'Proforma Invoice' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'REPORT', label: 'Report' },
];

// ─── Step 1 Schema ───

const basicInfoSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  documentType: z.string().min(1, 'Document type is required'),
  sortOrder: z.coerce.number().min(0).optional(),
  isDefault: z.boolean().optional(),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

// ─── Field Row Type ───

interface FieldRow {
  key: string;
  label: string;
  group: string;
}

// ─── Page Component ───

export default function NewTemplatePage() {
  const router = useRouter();
  const createMut = useCreateTemplate();
  const [step, setStep] = useState(0);
  const [industryCode, setIndustryCode] = useState<string | null>(null);

  // Step 1: react-hook-form + zod
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    getValues: getBasicValues,
  } = useForm<BasicInfoValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(basicInfoSchema) as any,
    defaultValues: {
      code: '',
      name: '',
      description: '',
      documentType: 'INVOICE',
      sortOrder: 0,
      isDefault: false,
    },
  });

  // Step 2: HTML Template
  const [htmlTemplate, setHtmlTemplate] = useState('');

  // Step 3: CSS Styles
  const [cssStyles, setCssStyles] = useState('');

  // Step 4: Settings & Fields
  const [settingsJson, setSettingsJson] = useState('{\n  "pageSize": "A4",\n  "orientation": "portrait"\n}');
  const [fields, setFields] = useState<FieldRow[]>([]);

  const addField = () => {
    setFields((prev) => [...prev, { key: '', label: '', group: 'General' }]);
  };

  const updateField = (index: number, field: keyof FieldRow, value: string) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    );
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Validation ───

  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const validateStep = (): boolean => {
    const errs: string[] = [];

    if (step === 1) {
      if (!htmlTemplate.trim()) errs.push('HTML template cannot be empty');
    }

    if (step === 3) {
      try {
        JSON.parse(settingsJson);
      } catch {
        errs.push('Settings must be valid JSON');
      }
      fields.forEach((f, i) => {
        if (!f.key.trim()) errs.push(`Field ${i + 1}: key is required`);
        if (!f.label.trim()) errs.push(`Field ${i + 1}: label is required`);
      });
    }

    setStepErrors(errs);
    return errs.length === 0;
  };

  // ─── Navigation ───

  const goNext = () => {
    if (!validateStep()) return;
    setStepErrors([]);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleStep1Next = () => {
    setStepErrors([]);
    setStep(1);
  };

  // ─── Build final DTO ───

  const buildDto = (): CreateDocumentTemplateDto => {
    const basic = getBasicValues();
    let parsedSettings: Record<string, unknown> = {};
    try {
      parsedSettings = JSON.parse(settingsJson);
    } catch {
      // fallback
    }

    return {
      code: basic.code,
      name: basic.name,
      description: basic.description || undefined,
      documentType: basic.documentType,
      htmlTemplate,
      cssStyles: cssStyles || undefined,
      defaultSettings: parsedSettings,
      availableFields: fields
        .filter((f) => f.key.trim() && f.label.trim())
        .map((f) => f.key),
      industryCode: industryCode || undefined,
      sortOrder: basic.sortOrder ?? 0,
      isDefault: basic.isDefault ?? false,
    };
  };

  // ─── Submit ───

  const handleCreate = async () => {
    try {
      const dto = buildDto();
      await createMut.mutateAsync(dto);
      toast.success('Template created successfully!');
      router.push('/templates');
    } catch {
      toast.error('Failed to create template');
    }
  };

  const dto = step === 4 ? buildDto() : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Template</h1>
          <p className="text-sm text-gray-500">
            Step {step + 1} of {STEPS.length} &mdash; {STEPS[step]}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (i < step) setStep(i);
              }}
              disabled={i > step}
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                i < step && 'bg-primary text-white cursor-pointer',
                i === step && 'bg-primary text-white ring-2 ring-primary/30',
                i > step && 'bg-gray-200 text-gray-400 cursor-not-allowed',
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </button>
            <span
              className={cn(
                'text-xs hidden lg:block mr-1',
                i <= step ? 'text-primary font-medium' : 'text-gray-400',
              )}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-6 h-0.5 mx-0.5',
                  i < step ? 'bg-primary' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Validation errors */}
      {stepErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          <ul className="list-disc list-inside space-y-0.5">
            {stepErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Step 1: Basic Info ─── */}
      {step === 0 && (
        <form
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSubmit={rhfHandleSubmit(handleStep1Next as any) as any}
          className="space-y-0"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Code *"
                  placeholder="e.g. invoice-standard"
                  error={errors.code?.message}
                  {...register('code')}
                />
                <Input
                  label="Name *"
                  placeholder="e.g. Standard Invoice"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>
              <Textarea
                label="Description"
                rows={3}
                placeholder="Describe what this template is for..."
                {...register('description')}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Document Type *"
                  options={DOCUMENT_TYPES}
                  {...register('documentType')}
                />
                <Input
                  label="Sort Order"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('sortOrder')}
                />
                <IndustrySelect
                  value={industryCode}
                  onChange={setIndustryCode}
                  label="Industry"
                  showAll
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  className="h-4 w-4 rounded border-gray-300"
                  {...register('isDefault')}
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default template for this document type
                </label>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" disabled>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* ─── Step 2: HTML Template ─── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5" />
              HTML Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              Write the HTML template for this document. Use {'{{fieldName}}'} placeholders for dynamic content.
            </p>
            <textarea
              className="w-full h-[400px] font-mono text-sm p-4 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              value={htmlTemplate}
              onChange={(e) => setHtmlTemplate(e.target.value)}
              placeholder={`<!DOCTYPE html>\n<html>\n<head>\n  <title>{{documentTitle}}</title>\n</head>\n<body>\n  <h1>{{companyName}}</h1>\n  <p>Invoice #{{invoiceNumber}}</p>\n</body>\n</html>`}
              spellCheck={false}
            />
          </CardContent>
        </Card>
      )}

      {/* ─── Step 3: CSS Styles ─── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Paintbrush className="h-5 w-5" />
              CSS Styles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              Add CSS styles to customize the look and feel of your document template. These styles will be injected into the template.
            </p>
            <textarea
              className="w-full h-[350px] font-mono text-sm p-4 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              value={cssStyles}
              onChange={(e) => setCssStyles(e.target.value)}
              placeholder={`body {\n  font-family: 'Arial', sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\n.header {\n  border-bottom: 2px solid #333;\n  padding-bottom: 10px;\n  margin-bottom: 20px;\n}`}
              spellCheck={false}
            />
          </CardContent>
        </Card>
      )}

      {/* ─── Step 4: Settings & Fields ─── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Settings JSON */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Default Settings (JSON)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">
                Configure default settings for this template such as page size, orientation, margins, etc.
              </p>
              <textarea
                className="w-full h-[200px] font-mono text-sm p-4 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                value={settingsJson}
                onChange={(e) => setSettingsJson(e.target.value)}
                placeholder='{"pageSize": "A4", "orientation": "portrait"}'
                spellCheck={false}
              />
            </CardContent>
          </Card>

          {/* Available Fields */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <List className="h-5 w-5" />
                Available Fields
              </CardTitle>
              <Button size="sm" onClick={addField}>
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  <List className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No fields added yet. Click &quot;Add Field&quot; to define template placeholders.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-2 font-medium">Key</th>
                        <th className="pb-2 pr-2 font-medium">Label</th>
                        <th className="pb-2 pr-2 font-medium">Group</th>
                        <th className="pb-2 font-medium w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((f, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="company_name"
                              value={f.key}
                              onChange={(e) => updateField(i, 'key', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="Company Name"
                              value={f.label}
                              onChange={(e) => updateField(i, 'label', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="py-2 pr-2">
                            <Input
                              placeholder="General"
                              value={f.group}
                              onChange={(e) => updateField(i, 'group', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </td>
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700"
                              onClick={() => removeField(i)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Step 5: Review ─── */}
      {step === 4 && dto && (
        <div className="space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Code</span>
                  <p className="font-mono font-medium">{dto.code}</p>
                </div>
                <div>
                  <span className="text-gray-500">Name</span>
                  <p className="font-medium">{dto.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Document Type</span>
                  <p className="font-medium">
                    {DOCUMENT_TYPES.find((d) => d.value === dto.documentType)?.label ?? dto.documentType}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Sort Order</span>
                  <p className="font-medium">{dto.sortOrder ?? 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Default</span>
                  <p className="font-medium">{dto.isDefault ? 'Yes' : 'No'}</p>
                </div>
                {dto.industryCode && (
                  <div>
                    <span className="text-gray-500">Industry</span>
                    <p className="font-medium">{dto.industryCode}</p>
                  </div>
                )}
              </div>
              {dto.description && (
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">Description</span>
                  <p className="mt-1 text-gray-700">{dto.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HTML Template Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5" />
                HTML Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[200px] overflow-auto font-mono text-xs p-3 border rounded-md bg-gray-50 whitespace-pre-wrap">
                {dto.htmlTemplate || 'No HTML template defined'}
              </pre>
            </CardContent>
          </Card>

          {/* CSS Preview */}
          {dto.cssStyles && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paintbrush className="h-5 w-5" />
                  CSS Styles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[150px] overflow-auto font-mono text-xs p-3 border rounded-md bg-gray-50 whitespace-pre-wrap">
                  {dto.cssStyles}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Default Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[150px] overflow-auto font-mono text-xs p-3 border rounded-md bg-gray-50 whitespace-pre-wrap">
                {JSON.stringify(dto.defaultSettings ?? {}, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <List className="h-5 w-5" />
                Available Fields ({dto.availableFields?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dto.availableFields && dto.availableFields.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dto.availableFields.map((key) => (
                    <Badge key={key} variant="secondary" className="font-mono text-xs">
                      {key}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No fields defined</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Navigation (steps 1-4, step 0 has its own in the form) ─── */}
      {step > 0 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setStepErrors([]);
              setStep((s) => Math.max(0, s - 1));
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={goNext}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate} loading={createMut.isPending}>
              <Save className="h-4 w-4" />
              Create Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
