'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Edit, Trash2, Save, X, IndianRupee, Star,
  Layers, Clock, Package, Info, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IndustryBadge } from '@/components/common/industry-badge';
import {
  usePackage, useDeletePackage,
  useUpdatePackageLimits, useUpdatePackageModule,
} from '@/hooks/use-packages';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import type { SubscriptionPackage, EntityLimit, PackageModuleConfig } from '@/types/package';
import type { ModulePricingType } from '@/types/module';

/* ── Constants ── */

const TIER_LABELS: Record<number, string> = {
  0: 'Free', 1: 'Basic', 2: 'Professional', 3: 'Enterprise',
};

const ENTITY_TYPES = [
  'CONTACTS', 'ORGANIZATIONS', 'LEADS', 'QUOTATIONS', 'INVOICES',
  'PRODUCTS', 'USERS', 'FILE_STORAGE_MB', 'DB_SIZE_MB',
  'MARKETPLACE_PROMOTIONS', 'EMAIL_PER_MONTH', 'WHATSAPP_PER_MONTH',
  'SMS_PER_MONTH', 'API_CALLS_PER_DAY', 'REPORTS_COUNT',
  'WORKFLOWS_COUNT', 'CUSTOM_FIELDS_COUNT',
] as const;

const PRICING_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'FREE', label: 'Free' },
  { value: 'INCLUDED', label: 'Included' },
  { value: 'ADDON', label: 'Add-on' },
  { value: 'ONE_TIME', label: 'One Time' },
  { value: 'PER_USAGE', label: 'Per Usage' },
];

function entityLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\bMB\b/g, '(MB)')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/* ── Tabs ── */

type TabKey = 'overview' | 'limits' | 'modules';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'limits', label: 'Entity Limits' },
  { key: 'modules', label: 'Modules' },
];

/* ── Component ── */

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = usePackage(params.id);
  const deleteMut = useDeletePackage();
  const updateLimitsMut = useUpdatePackageLimits();
  const updateModuleMut = useUpdatePackageModule();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [editing, setEditing] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pkg: SubscriptionPackage | undefined = (res as any)?.data;

  // Editable limits state
  const [editLimits, setEditLimits] = useState<Record<string, EntityLimit> | null>(null);

  // Derive current limits (from edit state or package)
  const currentLimits = useMemo(() => {
    if (editLimits) return editLimits;
    if (!pkg?.entityLimits) return {} as Record<string, EntityLimit>;
    return pkg.entityLimits;
  }, [editLimits, pkg]);

  /* ── Loading / Not Found ── */

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Package not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/packages')}>
          Back to Packages
        </Button>
      </div>
    );
  }

  /* ── Handlers ── */

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      await deleteMut.mutateAsync(pkg.id);
      toast.success('Package deleted');
      router.push('/packages');
    } catch {
      toast.error('Failed to delete package');
    }
  };

  const startEditLimits = () => {
    const init: Record<string, EntityLimit> = {};
    for (const key of ENTITY_TYPES) {
      init[key] = pkg.entityLimits?.[key] ?? { limit: 0, extraPricePerUnit: 0 };
    }
    setEditLimits(init);
  };

  const saveLimits = async () => {
    if (!editLimits) return;
    try {
      await updateLimitsMut.mutateAsync({ packageId: pkg.id, entityLimits: editLimits });
      toast.success('Limits updated');
      setEditLimits(null);
    } catch {
      toast.error('Failed to update limits');
    }
  };

  const handleModulePricingChange = async (moduleId: string, pricingType: ModulePricingType) => {
    try {
      await updateModuleMut.mutateAsync({
        packageId: pkg.id,
        moduleId,
        updates: { pricingType },
      });
      toast.success('Module pricing updated');
    } catch {
      toast.error('Failed to update module');
    }
  };

  const modules = pkg.packageModules ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/packages')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{pkg.packageName}</h1>
              {pkg.isPopular && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {pkg.badgeText || 'Popular'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={pkg.isActive ? 'success' : 'secondary'}>
                {pkg.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-gray-400">{pkg.packageCode}</span>
              <IndustryBadge industryCode={pkg.industryCode} />
              {pkg.tagline && <span className="text-sm text-gray-500">- {pkg.tagline}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditing(!editing)}
          >
            {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {editing ? 'Cancel' : 'Edit'}
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMut.isPending}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Price', value: formatCurrency(pkg.priceMonthlyInr), icon: IndianRupee, color: 'text-green-600' },
          { label: 'Yearly Price', value: formatCurrency(pkg.priceYearlyInr), icon: IndianRupee, color: 'text-purple-600' },
          { label: 'Modules', value: String(modules.length), icon: Layers, color: 'text-blue-600' },
          { label: 'Trial', value: `${pkg.trialDays} days`, icon: Clock, color: 'text-orange-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('h-8 w-8', stat.color)} />
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Package Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {pkg.description && (
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Description</span>
                  <p className="text-sm text-gray-700 mt-1">{pkg.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tier</span>
                  <p className="font-medium">{TIER_LABELS[pkg.tier] ?? `Tier ${pkg.tier}`}</p>
                </div>
                <div>
                  <span className="text-gray-500">Industry</span>
                  <div className="mt-0.5"><IndustryBadge industryCode={pkg.industryCode} /></div>
                </div>
                <div>
                  <span className="text-gray-500">Monthly</span>
                  <p className="font-medium">{formatCurrency(pkg.priceMonthlyInr)}</p>
                </div>
                {pkg.quarterlyPrice && pkg.quarterlyPrice > 0 && (
                  <div>
                    <span className="text-gray-500">Quarterly</span>
                    <p className="font-medium">{formatCurrency(pkg.quarterlyPrice)}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Yearly</span>
                  <p className="font-medium">{formatCurrency(pkg.priceYearlyInr)}</p>
                </div>
                {pkg.yearlyDiscountPct > 0 && (
                  <div>
                    <span className="text-gray-500">Yearly Discount</span>
                    <p className="font-medium">{pkg.yearlyDiscountPct}%</p>
                  </div>
                )}
                {pkg.oneTimeSetupFee && pkg.oneTimeSetupFee > 0 && (
                  <div>
                    <span className="text-gray-500">Setup Fee</span>
                    <p className="font-medium">{formatCurrency(pkg.oneTimeSetupFee)}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Trial Days</span>
                  <p className="font-medium">{pkg.trialDays}</p>
                </div>
                <div>
                  <span className="text-gray-500">Currency</span>
                  <p className="font-medium">{pkg.currency}</p>
                </div>
                <div>
                  <span className="text-gray-500">Dedicated DB</span>
                  <p className="font-medium flex items-center gap-1">
                    {pkg.hasDedicatedDb ? (
                      <><Check className="h-4 w-4 text-green-500" /> Yes{pkg.maxDbSizeMb ? ` (${pkg.maxDbSizeMb} MB)` : ''}</>
                    ) : 'No (Shared)'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Sort Order</span>
                  <p className="font-medium">{pkg.sortOrder}</p>
                </div>
                {pkg.color && (
                  <div>
                    <span className="text-gray-500">Color</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: pkg.color }} />
                      <span className="font-medium text-xs">{pkg.color}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary Card */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Pricing Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-xs text-gray-400 uppercase mb-1">Monthly</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(pkg.priceMonthlyInr)}</p>
                  <p className="text-xs text-gray-400">per month</p>
                </div>
                {pkg.quarterlyPrice && pkg.quarterlyPrice > 0 && (
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xs text-gray-400 uppercase mb-1">Quarterly</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(pkg.quarterlyPrice)}</p>
                    <p className="text-xs text-gray-400">per quarter</p>
                  </div>
                )}
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <p className="text-xs text-gray-400 uppercase mb-1">Yearly</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(pkg.priceYearlyInr)}</p>
                  <p className="text-xs text-gray-400">per year</p>
                  {pkg.yearlyDiscountPct > 0 && (
                    <Badge variant="success" className="mt-1">Save {pkg.yearlyDiscountPct}%</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module List (overview mode) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Included Modules ({modules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <p className="text-sm text-gray-400">No modules assigned to this package</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modules.map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{pm.module?.name ?? pm.moduleId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{pm.pricingType}</Badge>
                        <span className="text-xs text-gray-400">
                          {pm.enabledFeatures.length} features
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Entity Limits ── */}
      {activeTab === 'limits' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Entity Limits
              </CardTitle>
              <div className="flex gap-2">
                {editLimits ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setEditLimits(null)}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveLimits} loading={updateLimitsMut.isPending}>
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={startEditLimits}>
                    <Edit className="h-4 w-4" />
                    Edit Limits
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-2 font-medium text-gray-600">Entity</th>
                    <th className="text-center p-2 font-medium text-gray-600 w-32">Limit</th>
                    <th className="text-center p-2 font-medium text-gray-600 w-36">Extra Price/Unit</th>
                    {editLimits && <th className="text-center p-2 font-medium text-gray-600 w-24">Unlimited</th>}
                  </tr>
                </thead>
                <tbody>
                  {ENTITY_TYPES.map((key) => {
                    const lim = currentLimits[key] ?? { limit: 0, extraPricePerUnit: 0 };
                    const isUnlimited = lim.limit === -1;

                    if (!editLimits) {
                      // Read-only row
                      return (
                        <tr key={key} className="border-b">
                          <td className="p-2 text-gray-700 font-medium">{entityLabel(key)}</td>
                          <td className="p-2 text-center">
                            {isUnlimited ? (
                              <Badge variant="info">Unlimited</Badge>
                            ) : (
                              <span className="font-medium">{formatNumber(lim.limit)}</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {lim.extraPricePerUnit > 0 ? (
                              <span className="font-medium">{formatCurrency(lim.extraPricePerUnit)}</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    }

                    // Editable row
                    return (
                      <tr key={key} className="border-b">
                        <td className="p-2 text-gray-700 font-medium">{entityLabel(key)}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={isUnlimited ? '' : lim.limit || ''}
                            onChange={(e) => {
                              setEditLimits((prev) =>
                                prev ? { ...prev, [key]: { ...prev[key], limit: Number(e.target.value) } } : prev,
                              );
                            }}
                            disabled={isUnlimited}
                            placeholder={isUnlimited ? 'Unlimited' : '0'}
                            className="text-center"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={lim.extraPricePerUnit || ''}
                            onChange={(e) => {
                              setEditLimits((prev) =>
                                prev ? { ...prev, [key]: { ...prev[key], extraPricePerUnit: Number(e.target.value) } } : prev,
                              );
                            }}
                            placeholder="0"
                            leftIcon={<IndianRupee className="h-3 w-3" />}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={isUnlimited}
                            onChange={() => {
                              setEditLimits((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      [key]: {
                                        ...prev[key],
                                        limit: prev[key].limit === -1 ? 0 : -1,
                                      },
                                    }
                                  : prev,
                              );
                            }}
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

      {/* ── Tab: Modules ── */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {modules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No modules assigned to this package</p>
              </CardContent>
            </Card>
          ) : (
            modules.map((pm: PackageModuleConfig) => (
              <Card key={pm.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{pm.module?.name ?? pm.moduleId}</CardTitle>
                        {pm.module?.category && (
                          <Badge variant="secondary" className="mt-0.5">{pm.module.category}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {editing ? (
                        <Select
                          options={PRICING_TYPE_OPTIONS}
                          value={pm.pricingType}
                          onChange={(e) =>
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            handleModulePricingChange(pm.moduleId, e.target.value as any)
                          }
                          className="w-36"
                        />
                      ) : (
                        <Badge variant="outline">{pm.pricingType}</Badge>
                      )}
                      {pm.pricingType === 'ADDON' && pm.addonPrice && pm.addonPrice > 0 && (
                        <span className="text-sm font-medium text-primary">
                          {formatCurrency(pm.addonPrice)}
                        </span>
                      )}
                      {pm.trialAllowed && (
                        <Badge variant="info" className="text-[10px]">Trial OK</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Enabled Features */}
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Enabled Features ({pm.enabledFeatures.length})
                    </span>
                    {pm.enabledFeatures.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pm.enabledFeatures.map((feat) => {
                          const featureDef = pm.module?.features?.find((f) => f.code === feat);
                          return (
                            <Badge key={feat} variant="success" className="text-[10px]">
                              <Check className="h-3 w-3 mr-0.5" />
                              {featureDef?.name ?? feat}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">No features enabled</p>
                    )}
                  </div>

                  {/* Disabled Features */}
                  {pm.disabledFeatures.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Disabled Features ({pm.disabledFeatures.length})
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pm.disabledFeatures.map((feat) => {
                          const featureDef = pm.module?.features?.find((f) => f.code === feat);
                          return (
                            <Badge key={feat} variant="secondary" className="text-[10px] line-through">
                              {featureDef?.name ?? feat}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Module description */}
                  {pm.module?.description && (
                    <p className="text-xs text-gray-400 mt-3 border-t pt-3">{pm.module.description}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
