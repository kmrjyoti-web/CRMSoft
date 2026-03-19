'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Save, Check, Layers, Database,
  Star, Plus, Minus, Package, Info, Palette, IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { useCreatePackage } from '@/hooks/use-packages';
import { useModules } from '@/hooks/use-modules';
import { formatCurrency, cn, extractList } from '@/lib/utils';
import type { CreatePackageDto, EntityLimit } from '@/types/package';
import type { SoftwareModule, ModulePricingType } from '@/types/module';

/* ── Constants ── */

const STEPS = ['Basic Info', 'Module Selection', 'Entity Limits', 'Database & Storage', 'Review'];

const TIER_OPTIONS = [
  { value: '0', label: 'Tier 0 - Free' },
  { value: '1', label: 'Tier 1 - Basic' },
  { value: '2', label: 'Tier 2 - Professional' },
  { value: '3', label: 'Tier 3 - Enterprise' },
];

const PRICING_TYPE_OPTIONS: { value: ModulePricingType; label: string }[] = [
  { value: 'FREE', label: 'Free' },
  { value: 'INCLUDED', label: 'Included' },
  { value: 'ADDON', label: 'Add-on' },
  { value: 'ONE_TIME', label: 'One Time' },
  { value: 'PER_USAGE', label: 'Per Usage' },
];

const ENTITY_TYPES = [
  'CONTACTS', 'ORGANIZATIONS', 'LEADS', 'QUOTATIONS', 'INVOICES',
  'PRODUCTS', 'USERS', 'FILE_STORAGE_MB', 'DB_SIZE_MB',
  'MARKETPLACE_PROMOTIONS', 'EMAIL_PER_MONTH', 'WHATSAPP_PER_MONTH',
  'SMS_PER_MONTH', 'API_CALLS_PER_DAY', 'REPORTS_COUNT',
  'WORKFLOWS_COUNT', 'CUSTOM_FIELDS_COUNT',
] as const;

function entityLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\bMB\b/g, '(MB)')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/* ── Module config state ── */

interface ModuleConfigState {
  moduleId: string;
  pricingType: ModulePricingType;
  addonPrice: number;
  enabledFeatures: string[];
  trialAllowed: boolean;
}

/* ── Component ── */

export default function NewPackagePage() {
  const router = useRouter();
  const createMut = useCreatePackage();
  const { data: modulesRes } = useModules({ limit: 200 });
  const allModules: SoftwareModule[] = extractList<SoftwareModule>(modulesRes);

  const [step, setStep] = useState(0);

  // Step 1: Basic Info
  const [packageCode, setPackageCode] = useState('');
  const [packageName, setPackageName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState(1);
  const [priceMonthlyInr, setPriceMonthlyInr] = useState(0);
  const [quarterlyPrice, setQuarterlyPrice] = useState(0);
  const [priceYearlyInr, setPriceYearlyInr] = useState(0);
  const [oneTimeSetupFee, setOneTimeSetupFee] = useState(0);
  const [trialDays, setTrialDays] = useState(14);
  const [industryCode, setIndustryCode] = useState<string | null>(null);
  const [isPopular, setIsPopular] = useState(false);
  const [badgeText, setBadgeText] = useState('');
  const [color, setColor] = useState('#6366f1');

  // Step 2: Module Selection
  const [moduleConfigs, setModuleConfigs] = useState<ModuleConfigState[]>([]);

  // Step 3: Entity Limits
  const [entityLimits, setEntityLimits] = useState<Record<string, EntityLimit>>(() => {
    const init: Record<string, EntityLimit> = {};
    for (const key of ENTITY_TYPES) {
      init[key] = { limit: 0, extraPricePerUnit: 0 };
    }
    return init;
  });

  // Step 4: DB & Storage
  const [hasDedicatedDb, setHasDedicatedDb] = useState(false);
  const [maxDbSizeMb, setMaxDbSizeMb] = useState(500);

  /* ── Module helpers ── */

  const selectedModuleIds = useMemo(() => new Set(moduleConfigs.map((c) => c.moduleId)), [moduleConfigs]);

  const modulesByCategory = useMemo(() => {
    const groups: Record<string, SoftwareModule[]> = {};
    for (const m of allModules) {
      const cat = m.category || 'OTHER';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(m);
    }
    return groups;
  }, [allModules]);

  const addModule = (mod: SoftwareModule) => {
    if (selectedModuleIds.has(mod.id)) return;
    setModuleConfigs((prev) => [
      ...prev,
      {
        moduleId: mod.id,
        pricingType: mod.defaultPricingType || 'INCLUDED',
        addonPrice: 0,
        enabledFeatures: mod.features.filter((f) => f.isDefault).map((f) => f.code),
        trialAllowed: true,
      },
    ]);
  };

  const removeModule = (moduleId: string) => {
    setModuleConfigs((prev) => prev.filter((c) => c.moduleId !== moduleId));
  };

  const updateModuleConfig = (moduleId: string, updates: Partial<ModuleConfigState>) => {
    setModuleConfigs((prev) =>
      prev.map((c) => (c.moduleId === moduleId ? { ...c, ...updates } : c)),
    );
  };

  const toggleFeature = (moduleId: string, featureCode: string) => {
    setModuleConfigs((prev) =>
      prev.map((c) => {
        if (c.moduleId !== moduleId) return c;
        const has = c.enabledFeatures.includes(featureCode);
        return {
          ...c,
          enabledFeatures: has
            ? c.enabledFeatures.filter((f) => f !== featureCode)
            : [...c.enabledFeatures, featureCode],
        };
      }),
    );
  };

  /* ── Entity limit helpers ── */

  const setEntityLimit = (key: string, field: 'limit' | 'extraPricePerUnit', value: number) => {
    setEntityLimits((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const toggleUnlimited = (key: string) => {
    setEntityLimits((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        limit: prev[key].limit === -1 ? 0 : -1,
      },
    }));
  };

  /* ── Submit ── */

  const handleSubmit = async () => {
    if (!packageCode.trim() || !packageName.trim()) {
      toast.error('Package code and name are required');
      return;
    }
    if (priceMonthlyInr <= 0 && tier > 0) {
      toast.error('Monthly price is required for paid tiers');
      return;
    }

    const data: CreatePackageDto = {
      packageCode: packageCode.trim(),
      packageName: packageName.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim() || undefined,
      tier,
      priceMonthlyInr,
      quarterlyPrice: quarterlyPrice || undefined,
      priceYearlyInr,
      oneTimeSetupFee: oneTimeSetupFee || undefined,
      trialDays,
      isPopular,
      badgeText: badgeText.trim() || undefined,
      color: color || undefined,
      entityLimits,
      hasDedicatedDb,
      maxDbSizeMb: hasDedicatedDb ? maxDbSizeMb : undefined,
      industryCode: industryCode || undefined,
    };

    try {
      await createMut.mutateAsync(data);
      toast.success('Package created successfully!');
      router.push('/packages');
    } catch {
      toast.error('Failed to create package');
    }
  };

  /* ── Helpers for selected modules ── */

  const getModule = (moduleId: string) => allModules.find((m) => m.id === moduleId);

  /* ── Navigation ── */

  const canProceed = () => {
    if (step === 0) return packageCode.trim() !== '' && packageName.trim() !== '';
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Package</h1>
          <p className="text-sm text-gray-500">Step {step + 1} of {STEPS.length} &mdash; {STEPS[step]}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                i < step ? 'bg-primary text-white cursor-pointer' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500',
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            <span className={cn('text-xs hidden md:block', i <= step ? 'text-primary font-medium' : 'text-gray-400')}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className={cn('w-6 h-0.5', i < step ? 'bg-primary' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Basic Info ── */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Package Code *"
                value={packageCode}
                onChange={(e) => setPackageCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                placeholder="e.g. PRO_PLAN"
              />
              <Input
                label="Package Name *"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g. Professional Plan"
              />
            </div>
            <Input
              label="Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Best for growing teams"
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what this package offers..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tier"
                options={TIER_OPTIONS}
                value={String(tier)}
                onChange={(e) => setTier(Number(e.target.value))}
              />
              <IndustrySelect
                value={industryCode}
                onChange={setIndustryCode}
                label="Industry"
                showAll
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Monthly Price (INR)"
                type="number"
                value={priceMonthlyInr || ''}
                onChange={(e) => setPriceMonthlyInr(Number(e.target.value))}
                leftIcon={<IndianRupee className="h-4 w-4" />}
              />
              <Input
                label="Quarterly Price (INR)"
                type="number"
                value={quarterlyPrice || ''}
                onChange={(e) => setQuarterlyPrice(Number(e.target.value))}
                leftIcon={<IndianRupee className="h-4 w-4" />}
              />
              <Input
                label="Yearly Price (INR)"
                type="number"
                value={priceYearlyInr || ''}
                onChange={(e) => setPriceYearlyInr(Number(e.target.value))}
                leftIcon={<IndianRupee className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="One-Time Setup Fee (INR)"
                type="number"
                value={oneTimeSetupFee || ''}
                onChange={(e) => setOneTimeSetupFee(Number(e.target.value))}
                leftIcon={<IndianRupee className="h-4 w-4" />}
              />
              <Input
                label="Trial Days"
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
              </label>
              {isPopular && (
                <Input
                  label="Badge Text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. Most Popular"
                  className="w-48"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">Package Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-400">{color}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Module Selection ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Available Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Available Modules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(modulesByCategory).map(([category, mods]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {category.replace(/_/g, ' ')}
                  </h4>
                  <div className="space-y-1">
                    {mods.map((mod) => {
                      const isSelected = selectedModuleIds.has(mod.id);
                      return (
                        <div
                          key={mod.id}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg border transition-colors',
                            isSelected ? 'border-primary/30 bg-primary/5 opacity-60' : 'border-gray-200 hover:border-gray-300',
                          )}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{mod.name}</p>
                            <p className="text-xs text-gray-400">{mod.features.length} features</p>
                          </div>
                          <Button
                            variant={isSelected ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => (isSelected ? removeModule(mod.id) : addModule(mod))}
                            className="shrink-0 ml-2"
                          >
                            {isSelected ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {allModules.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No modules available</p>
              )}
            </CardContent>
          </Card>

          {/* Right: Selected Modules with Config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Selected Modules ({moduleConfigs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {moduleConfigs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Click + on available modules to add them
                </p>
              ) : (
                moduleConfigs.map((config) => {
                  const mod = getModule(config.moduleId);
                  if (!mod) return null;
                  return (
                    <div key={config.moduleId} className="border border-gray-200 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{mod.name}</p>
                          <Badge variant="secondary" className="mt-0.5">{mod.category}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeModule(config.moduleId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Pricing Type */}
                      <Select
                        label="Pricing Type"
                        options={PRICING_TYPE_OPTIONS}
                        value={config.pricingType}
                        onChange={(e) =>
                          updateModuleConfig(config.moduleId, { pricingType: e.target.value as ModulePricingType })
                        }
                      />

                      {/* Addon Price (shown only when ADDON) */}
                      {config.pricingType === 'ADDON' && (
                        <Input
                          label="Add-on Price (INR)"
                          type="number"
                          value={config.addonPrice || ''}
                          onChange={(e) =>
                            updateModuleConfig(config.moduleId, { addonPrice: Number(e.target.value) })
                          }
                          leftIcon={<IndianRupee className="h-4 w-4" />}
                        />
                      )}

                      {/* Feature Toggles */}
                      {mod.features.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Features</label>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {mod.features.map((feat) => (
                              <label
                                key={feat.code}
                                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                              >
                                <input
                                  type="checkbox"
                                  checked={config.enabledFeatures.includes(feat.code)}
                                  onChange={() => toggleFeature(config.moduleId, feat.code)}
                                  className="h-3.5 w-3.5 rounded border-gray-300"
                                />
                                <span className="text-gray-700">{feat.name}</span>
                                <Badge variant="outline" className="text-[10px] px-1">{feat.type}</Badge>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trial Allowed */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.trialAllowed}
                          onChange={(e) =>
                            updateModuleConfig(config.moduleId, { trialAllowed: e.target.checked })
                          }
                          className="h-3.5 w-3.5 rounded border-gray-300"
                        />
                        <span className="text-xs font-medium text-gray-600">Trial allowed</span>
                      </label>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Step 3: Entity Limits ── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Entity Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-2 font-medium text-gray-600">Entity</th>
                    <th className="text-center p-2 font-medium text-gray-600 w-32">Limit</th>
                    <th className="text-center p-2 font-medium text-gray-600 w-36">Extra Price/Unit</th>
                    <th className="text-center p-2 font-medium text-gray-600 w-24">Unlimited</th>
                  </tr>
                </thead>
                <tbody>
                  {ENTITY_TYPES.map((key) => {
                    const lim = entityLimits[key];
                    const isUnlimited = lim.limit === -1;
                    return (
                      <tr key={key} className="border-b">
                        <td className="p-2 text-gray-700 font-medium">{entityLabel(key)}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={isUnlimited ? '' : lim.limit || ''}
                            onChange={(e) => setEntityLimit(key, 'limit', Number(e.target.value))}
                            disabled={isUnlimited}
                            placeholder={isUnlimited ? 'Unlimited' : '0'}
                            className="text-center"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={lim.extraPricePerUnit || ''}
                            onChange={(e) => setEntityLimit(key, 'extraPricePerUnit', Number(e.target.value))}
                            placeholder="0"
                            leftIcon={<IndianRupee className="h-3 w-3" />}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={isUnlimited}
                            onChange={() => toggleUnlimited(key)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Database & Storage ── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={hasDedicatedDb}
                onChange={(e) => setHasDedicatedDb(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Dedicated Database</p>
                <p className="text-xs text-gray-500">
                  Each tenant gets their own database instance for complete data isolation
                </p>
              </div>
            </label>

            {hasDedicatedDb && (
              <Input
                label="Max Database Size (MB)"
                type="number"
                value={maxDbSizeMb}
                onChange={(e) => setMaxDbSizeMb(Number(e.target.value))}
                placeholder="e.g. 1024"
              />
            )}

            {!hasDedicatedDb && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Shared Database</p>
                  <p className="text-xs text-blue-600">
                    Tenants will share the global database with row-level isolation.
                    This is cost-effective for smaller plans.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 5: Review ── */}
      {step === 4 && (
        <div className="space-y-4">
          {/* Basic Info Summary */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Basic Info</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500">Code:</span> <strong>{packageCode}</strong></div>
                <div><span className="text-gray-500">Name:</span> <strong>{packageName}</strong></div>
                <div><span className="text-gray-500">Tier:</span> <strong>{TIER_OPTIONS.find((t) => t.value === String(tier))?.label}</strong></div>
                <div><span className="text-gray-500">Monthly:</span> <strong>{formatCurrency(priceMonthlyInr)}</strong></div>
                {quarterlyPrice > 0 && (
                  <div><span className="text-gray-500">Quarterly:</span> <strong>{formatCurrency(quarterlyPrice)}</strong></div>
                )}
                <div><span className="text-gray-500">Yearly:</span> <strong>{formatCurrency(priceYearlyInr)}</strong></div>
                {oneTimeSetupFee > 0 && (
                  <div><span className="text-gray-500">Setup Fee:</span> <strong>{formatCurrency(oneTimeSetupFee)}</strong></div>
                )}
                <div><span className="text-gray-500">Trial:</span> <strong>{trialDays} days</strong></div>
                <div><span className="text-gray-500">Popular:</span> <strong>{isPopular ? 'Yes' : 'No'}</strong></div>
                <div><span className="text-gray-500">Dedicated DB:</span> <strong>{hasDedicatedDb ? `Yes (${maxDbSizeMb} MB)` : 'No'}</strong></div>
              </div>
              {tagline && <p className="text-sm text-gray-500 mt-3 italic">{tagline}</p>}
              {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
            </CardContent>
          </Card>

          {/* Modules Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Modules ({moduleConfigs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moduleConfigs.length === 0 ? (
                <p className="text-sm text-gray-400">No modules selected</p>
              ) : (
                <div className="space-y-2">
                  {moduleConfigs.map((config) => {
                    const mod = getModule(config.moduleId);
                    if (!mod) return null;
                    return (
                      <div key={config.moduleId} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{mod.name}</span>
                          <Badge variant="outline" className="text-[10px]">{config.pricingType}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{config.enabledFeatures.length}/{mod.features.length} features</span>
                          {config.pricingType === 'ADDON' && (
                            <span className="font-medium text-primary">{formatCurrency(config.addonPrice)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Limits Summary */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Entity Limits</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {ENTITY_TYPES.map((key) => {
                  const lim = entityLimits[key];
                  if (lim.limit === 0 && lim.extraPricePerUnit === 0) return null;
                  return (
                    <div key={key} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                      <span className="text-gray-600 text-xs">{entityLabel(key)}</span>
                      <span className="font-medium text-xs">
                        {lim.limit === -1 ? 'Unlimited' : lim.limit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between pt-2 pb-8">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={createMut.isPending}>
            <Save className="h-4 w-4" />
            Create Package
          </Button>
        )}
      </div>
    </div>
  );
}
