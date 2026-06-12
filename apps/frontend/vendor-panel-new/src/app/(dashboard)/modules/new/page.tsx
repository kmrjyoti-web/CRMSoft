'use client';

import { useState, useMemo } from 'react';
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
  Layers,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useModules, useCreateModule } from '@/hooks/use-modules';
import { IndustrySelect } from '@/components/common/industry-select';
import { MODULE_CATEGORIES } from '@/lib/constants';
import { cn, extractList, formatCurrency } from '@/lib/utils';
import type {
  ModuleFeature,
  FeatureType,
  ModulePricingType,
  SoftwareModule,
  CreateModuleDto,
} from '@/types/module';

// ─── Constants ───

const STEPS = [
  'Basic Info',
  'Features',
  'Dependencies',
  'Pricing',
  'Trial',
  'Review',
];

const FEATURE_TYPES: { value: FeatureType; label: string }[] = [
  { value: 'PAGE', label: 'Page' },
  { value: 'WIDGET', label: 'Widget' },
  { value: 'REPORT', label: 'Report' },
  { value: 'ACTION', label: 'Action' },
  { value: 'INTEGRATION', label: 'Integration' },
];

const PRICING_TYPES: { value: ModulePricingType; label: string }[] = [
  { value: 'FREE', label: 'Free' },
  { value: 'INCLUDED', label: 'Included' },
  { value: 'ADDON', label: 'Add-on' },
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'PER_USAGE', label: 'Per Usage' },
];

// ─── Step 1 Schema ───

const basicInfoSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  version: z.string().min(1, 'Version is required'),
  iconName: z.string().optional(),
  isCore: z.boolean().optional(),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

// ─── Feature Row Type ───

interface FeatureRow {
  code: string;
  name: string;
  type: FeatureType;
  menuKey: string;
  isDefault: boolean;
}

// ─── Usage Pricing Row ───

interface UsagePricingRow {
  key: string;
  price: number;
}

// ─── Page Component ───

export default function NewModulePage() {
  const router = useRouter();
  const createMut = useCreateModule();
  const [step, setStep] = useState(0);
  const [industryCode, setIndustryCode] = useState<string | null>(null);

  // Step 1: react-hook-form + zod
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    watch,
    getValues: getBasicValues,
  } = useForm<BasicInfoValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(basicInfoSchema) as any,
    defaultValues: {
      code: '',
      name: '',
      description: '',
      category: 'CORE',
      version: '1.0.0',
      iconName: '',
      isCore: false,
    },
  });

  const basicValues = watch();

  // Step 2: Features
  const [features, setFeatures] = useState<FeatureRow[]>([]);

  const addFeature = () => {
    setFeatures((prev) => [
      ...prev,
      { code: '', name: '', type: 'PAGE', menuKey: '', isDefault: true },
    ]);
  };

  const updateFeature = (index: number, field: keyof FeatureRow, value: string | boolean) => {
    setFeatures((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    );
  };

  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 3: Dependencies
  const { data: allModulesRes } = useModules({ limit: 200 });
  const allModules: SoftwareModule[] = extractList(allModulesRes);
  const [selectedDeps, setSelectedDeps] = useState<string[]>([]);

  const toggleDep = (code: string) => {
    setSelectedDeps((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  // Step 4: Pricing
  const [pricingType, setPricingType] = useState<ModulePricingType>('FREE');
  const [basePrice, setBasePrice] = useState(0);
  const [priceMonthly, setPriceMonthly] = useState(0);
  const [priceYearly, setPriceYearly] = useState(0);
  const [oneTimeSetupFee, setOneTimeSetupFee] = useState(0);
  const [usagePricing, setUsagePricing] = useState<UsagePricingRow[]>([]);

  const addUsageRow = () => {
    setUsagePricing((prev) => [...prev, { key: '', price: 0 }]);
  };

  const updateUsageRow = (index: number, field: keyof UsagePricingRow, value: string | number) => {
    setUsagePricing((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const removeUsageRow = (index: number) => {
    setUsagePricing((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 5: Trial
  const [trialDays, setTrialDays] = useState(0);
  const [trialFeatures, setTrialFeatures] = useState<string[]>([]);

  const toggleTrialFeature = (code: string) => {
    setTrialFeatures((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  // ─── Validation ───

  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const validateStep = (): boolean => {
    const errs: string[] = [];

    if (step === 1) {
      // Features step: each feature must have code + name
      features.forEach((f, i) => {
        if (!f.code.trim()) errs.push(`Feature ${i + 1}: code is required`);
        if (!f.name.trim()) errs.push(`Feature ${i + 1}: name is required`);
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
    // Validate step 1 via react-hook-form, then advance
    setStepErrors([]);
    setStep(1);
  };

  // ─── Build final DTO ───

  const buildDto = (): CreateModuleDto => {
    const basic = getBasicValues();
    const moduleFeatures: ModuleFeature[] = features
      .filter((f) => f.code.trim() && f.name.trim())
      .map((f) => ({
        code: f.code,
        name: f.name,
        type: f.type,
        menuKey: f.menuKey || null,
        isDefault: f.isDefault,
      }));

    const usagePricingMap: Record<string, number> = {};
    usagePricing.forEach((r) => {
      if (r.key.trim()) usagePricingMap[r.key] = r.price;
    });

    return {
      code: basic.code,
      name: basic.name,
      description: basic.description || undefined,
      category: basic.category as CreateModuleDto['category'],
      version: basic.version,
      iconName: basic.iconName || undefined,
      isCore: basic.isCore ?? false,
      features: moduleFeatures,
      dependsOn: selectedDeps,
      defaultPricingType: pricingType,
      basePrice,
      priceMonthly: priceMonthly || undefined,
      priceYearly: priceYearly || undefined,
      oneTimeSetupFee: oneTimeSetupFee || undefined,
      trialDays,
      trialFeatures,
      usagePricing: Object.keys(usagePricingMap).length > 0 ? usagePricingMap : undefined,
      industryCode: industryCode || undefined,
    };
  };

  // ─── Submit ───

  const handleCreate = async () => {
    try {
      const dto = buildDto();
      await createMut.mutateAsync(dto);
      toast.success('Module created successfully!');
      router.push('/modules');
    } catch {
      toast.error('Failed to create module');
    }
  };

  // ─── Computed ───

  const featureNames = useMemo(
    () => features.filter((f) => f.code.trim()).map((f) => ({ code: f.code, name: f.name })),
    [features],
  );

  const dto = step === 5 ? buildDto() : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Module</h1>
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
                  placeholder="e.g. crm-leads"
                  error={errors.code?.message}
                  {...register('code')}
                />
                <Input
                  label="Name *"
                  placeholder="e.g. Lead Management"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>
              <Textarea
                label="Description"
                rows={3}
                placeholder="Describe what this module does..."
                {...register('description')}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Category *"
                  options={MODULE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                  {...register('category')}
                />
                <Input
                  label="Version *"
                  placeholder="1.0.0"
                  error={errors.version?.message}
                  {...register('version')}
                />
                <Input
                  label="Icon Name"
                  placeholder="e.g. Layers"
                  {...register('iconName')}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isCore"
                  className="h-4 w-4 rounded border-gray-300"
                  {...register('isCore')}
                />
                <label htmlFor="isCore" className="text-sm text-gray-700">
                  This is a core module (included in all plans)
                </label>
              </div>
              <IndustrySelect
                value={industryCode}
                onChange={setIndustryCode}
                label="Industry"
                showAll
              />
            </CardContent>
          </Card>
          {/* Hidden submit for step 1 form validation */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              disabled
            >
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

      {/* ─── Step 2: Features ─── */}
      {step === 1 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Module Features</CardTitle>
            <Button size="sm" onClick={addFeature}>
              <Plus className="h-4 w-4" />
              Add Feature
            </Button>
          </CardHeader>
          <CardContent>
            {features.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                <Layers className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No features added yet. Click &quot;Add Feature&quot; to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 pr-2 font-medium">Code</th>
                      <th className="pb-2 pr-2 font-medium">Name</th>
                      <th className="pb-2 pr-2 font-medium">Type</th>
                      <th className="pb-2 pr-2 font-medium">Menu Key</th>
                      <th className="pb-2 pr-2 font-medium text-center">Default</th>
                      <th className="pb-2 font-medium w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((f, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 pr-2">
                          <Input
                            placeholder="feature-code"
                            value={f.code}
                            onChange={(e) => updateFeature(i, 'code', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <Input
                            placeholder="Feature Name"
                            value={f.name}
                            onChange={(e) => updateFeature(i, 'name', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <Select
                            options={FEATURE_TYPES}
                            value={f.type}
                            onChange={(e) => updateFeature(i, 'type', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <Input
                            placeholder="menu-key"
                            value={f.menuKey}
                            onChange={(e) => updateFeature(i, 'menuKey', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="py-2 pr-2 text-center">
                          <input
                            type="checkbox"
                            checked={f.isDefault}
                            onChange={(e) => updateFeature(i, 'isDefault', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => removeFeature(i)}
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
      )}

      {/* ─── Step 3: Dependencies ─── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dependencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Select modules that this module depends on. These will be required before activation.
            </p>

            {/* Selected as tags */}
            {selectedDeps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDeps.map((code) => {
                  const m = allModules.find((mod) => mod.code === code);
                  return (
                    <Badge
                      key={code}
                      variant="secondary"
                      className="cursor-pointer gap-1 pr-1.5"
                      onClick={() => toggleDep(code)}
                    >
                      {m?.name ?? code}
                      <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Available modules list */}
            <div className="border rounded-md max-h-64 overflow-y-auto divide-y">
              {allModules.length === 0 ? (
                <div className="p-4 text-sm text-gray-400 text-center">
                  No other modules available
                </div>
              ) : (
                allModules
                  .filter((m) => m.code !== basicValues.code)
                  .map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDeps.includes(m.code)}
                        onChange={() => toggleDep(m.code)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{m.code}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {m.category}
                      </Badge>
                    </label>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Step 4: Pricing ─── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Select
              label="Default Pricing Type"
              options={PRICING_TYPES}
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value as ModulePricingType)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Base Price"
                type="number"
                min={0}
                step={0.01}
                leftIcon={<IndianRupee className="h-4 w-4" />}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
              />
              <Input
                label="Monthly Price"
                type="number"
                min={0}
                step={0.01}
                leftIcon={<IndianRupee className="h-4 w-4" />}
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(Number(e.target.value))}
              />
              <Input
                label="Yearly Price"
                type="number"
                min={0}
                step={0.01}
                leftIcon={<IndianRupee className="h-4 w-4" />}
                value={priceYearly}
                onChange={(e) => setPriceYearly(Number(e.target.value))}
              />
              <Input
                label="One-time Setup Fee"
                type="number"
                min={0}
                step={0.01}
                leftIcon={<IndianRupee className="h-4 w-4" />}
                value={oneTimeSetupFee}
                onChange={(e) => setOneTimeSetupFee(Number(e.target.value))}
              />
            </div>

            {/* Usage Pricing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Usage-Based Pricing</label>
                <Button size="sm" variant="outline" onClick={addUsageRow}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Row
                </Button>
              </div>
              {usagePricing.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No usage-based pricing configured. Click &quot;Add Row&quot; to add one.
                </p>
              ) : (
                <div className="space-y-2">
                  {usagePricing.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder="Key (e.g. api-calls)"
                        value={row.key}
                        onChange={(e) => updateUsageRow(i, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Price"
                        leftIcon={<IndianRupee className="h-3.5 w-3.5" />}
                        value={row.price}
                        onChange={(e) => updateUsageRow(i, 'price', Number(e.target.value))}
                        className="w-40"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-700 flex-shrink-0"
                        onClick={() => removeUsageRow(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Step 5: Trial ─── */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trial Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Trial Days"
              type="number"
              min={0}
              placeholder="e.g. 14"
              value={trialDays}
              onChange={(e) => setTrialDays(Number(e.target.value))}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Trial Features
              </label>
              <p className="text-xs text-gray-400">
                Select which features are available during the trial period.
              </p>
              {featureNames.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No features defined. Go back to Step 2 to add features first.
                </p>
              ) : (
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {featureNames.map((f) => (
                    <label
                      key={f.code}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={trialFeatures.includes(f.code)}
                        onChange={() => toggleTrialFeature(f.code)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{f.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{f.code}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Step 6: Review ─── */}
      {step === 5 && dto && (
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
                  <span className="text-gray-500">Category</span>
                  <p className="font-medium">{dto.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Version</span>
                  <p className="font-medium">{dto.version}</p>
                </div>
                <div>
                  <span className="text-gray-500">Core Module</span>
                  <p className="font-medium">{dto.isCore ? 'Yes' : 'No'}</p>
                </div>
                {dto.iconName && (
                  <div>
                    <span className="text-gray-500">Icon</span>
                    <p className="font-medium">{dto.iconName}</p>
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

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Features ({dto.features?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dto.features && dto.features.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 font-medium">Code</th>
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Type</th>
                        <th className="pb-2 font-medium">Menu Key</th>
                        <th className="pb-2 font-medium text-center">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dto.features.map((f) => (
                        <tr key={f.code} className="border-b last:border-0">
                          <td className="py-2 font-mono text-xs">{f.code}</td>
                          <td className="py-2">{f.name}</td>
                          <td className="py-2">
                            <Badge variant="outline" className="text-[10px]">
                              {f.type}
                            </Badge>
                          </td>
                          <td className="py-2 font-mono text-xs text-gray-400">
                            {f.menuKey ?? '—'}
                          </td>
                          <td className="py-2 text-center">
                            {f.isDefault ? (
                              <Check className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No features defined</p>
              )}
            </CardContent>
          </Card>

          {/* Dependencies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Dependencies ({dto.dependsOn?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dto.dependsOn && dto.dependsOn.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dto.dependsOn.map((code) => (
                    <Badge key={code} variant="secondary">
                      {code}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No dependencies</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type</span>
                  <p className="font-medium">
                    {PRICING_TYPES.find((p) => p.value === dto.defaultPricingType)?.label ?? dto.defaultPricingType}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Base Price</span>
                  <p className="font-medium">{formatCurrency(dto.basePrice ?? 0)}</p>
                </div>
                {dto.priceMonthly != null && (
                  <div>
                    <span className="text-gray-500">Monthly</span>
                    <p className="font-medium">{formatCurrency(dto.priceMonthly)}/mo</p>
                  </div>
                )}
                {dto.priceYearly != null && (
                  <div>
                    <span className="text-gray-500">Yearly</span>
                    <p className="font-medium">{formatCurrency(dto.priceYearly)}/yr</p>
                  </div>
                )}
                {dto.oneTimeSetupFee != null && (
                  <div>
                    <span className="text-gray-500">Setup Fee</span>
                    <p className="font-medium">{formatCurrency(dto.oneTimeSetupFee)}</p>
                  </div>
                )}
              </div>
              {dto.usagePricing && Object.keys(dto.usagePricing).length > 0 && (
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Usage Pricing</span>
                  <div className="mt-1 space-y-1">
                    {Object.entries(dto.usagePricing).map(([key, price]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-mono text-gray-600">{key}</span>
                        <span className="font-medium">{formatCurrency(price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Trial Days</span>
                  <p className="font-medium">{dto.trialDays ?? 0} days</p>
                </div>
                <div>
                  <span className="text-gray-500">Trial Features</span>
                  {dto.trialFeatures && dto.trialFeatures.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dto.trialFeatures.map((code) => (
                        <Badge key={code} variant="secondary" className="text-[10px]">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="font-medium text-gray-400">All features</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Navigation (steps 1-5, step 0 has its own in the form) ─── */}
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
              Create Module
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
