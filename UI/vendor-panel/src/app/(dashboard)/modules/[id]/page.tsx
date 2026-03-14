'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Code,
  X,
  Save,
  Package,
  GitBranch,
  Calendar,
  Shield,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/status-badge';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { useModule, useUpdateModule, useDeleteModule } from '@/hooks/use-modules';
import { modulesApi } from '@/lib/api/modules';
import { formatCurrency, formatNumber, formatDate, extractList, extractMeta, cn } from '@/lib/utils';
import { MODULE_CATEGORIES } from '@/lib/constants';
import type { SoftwareModule, ModulePricingType } from '@/types/module';

// ─── Constants ───

const PRICING_TYPES: { value: ModulePricingType; label: string }[] = [
  { value: 'FREE', label: 'Free' },
  { value: 'INCLUDED', label: 'Included' },
  { value: 'ADDON', label: 'Add-on' },
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'PER_USAGE', label: 'Per Usage' },
];

const TABS = ['Overview', 'Pricing', 'Subscribers'] as const;
type Tab = (typeof TABS)[number];

// ─── Page Component ───

export default function ModuleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useModule(params.id);
  const updateMut = useUpdateModule();
  const deleteMut = useDeleteModule();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [editing, setEditing] = useState(false);

  const mod: SoftwareModule | undefined = res?.data;

  // ─── Edit form state ───
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editVersion, setEditVersion] = useState('');
  const [editIconName, setEditIconName] = useState('');
  const [editIndustryCode, setEditIndustryCode] = useState<string | null>(null);

  const startEditing = () => {
    if (!mod) return;
    setEditName(mod.name);
    setEditDescription(mod.description ?? '');
    setEditCategory(mod.category);
    setEditVersion(mod.version);
    setEditIconName(mod.iconName ?? '');
    setEditIndustryCode(mod.industryCode ?? null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const saveEdits = async () => {
    if (!mod) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: Record<string, any> = {
        name: editName,
        description: editDescription || undefined,
        category: editCategory,
        version: editVersion,
        iconName: editIconName || undefined,
        industryCode: editIndustryCode,
      };
      await updateMut.mutateAsync({ id: mod.id, data });
      toast.success('Module updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update module');
    }
  };

  // ─── Subscribers query ───
  const [subPage, setSubPage] = useState(1);
  const { data: subRes, isLoading: subLoading } = useQuery({
    queryKey: ['module-subscribers', params.id, subPage],
    queryFn: () => modulesApi.getSubscribers(params.id, { page: subPage, limit: 10 }),
    enabled: activeTab === 'Subscribers' && !!params.id,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscribers: any[] = extractList(subRes);
  const subMeta = extractMeta(subRes);

  // ─── Delete ───
  const handleDelete = async () => {
    if (!confirm('Delete this module? This action cannot be undone.')) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deleteMut.mutateAsync((mod as any).id);
      toast.success('Module deleted');
      router.push('/modules');
    } catch {
      toast.error('Failed to delete module');
    }
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Module not found</p>
        <Button variant="outline" onClick={() => router.push('/modules')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Modules
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/modules')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mod.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge value={mod.moduleStatus ?? (mod.isActive ? 'ACTIVE' : 'INACTIVE')} />
              <Badge variant="outline">{mod.category}</Badge>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {mod.code}
              </Badge>
              {mod.isCore && (
                <Badge variant="info">
                  <Shield className="h-3 w-3 mr-0.5" />
                  Core
                </Badge>
              )}
              <IndustryBadge industryCode={mod.industryCode} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={cancelEditing}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={saveEdits} loading={updateMut.isPending}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEditing}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} loading={deleteMut.isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Subscribers',
            value: formatNumber(mod._count?.tenantModules ?? 0),
            icon: Users,
            color: 'text-blue-600',
          },
          {
            label: 'Features',
            value: String(mod.features?.length ?? 0),
            icon: Package,
            color: 'text-orange-600',
          },
          {
            label: 'Version',
            value: `v${mod.version}`,
            icon: Code,
            color: 'text-purple-600',
          },
          {
            label: 'Dependencies',
            value: String(mod.dependsOn?.length ?? 0),
            icon: GitBranch,
            color: 'text-teal-600',
          },
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

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <Select
                      label="Category"
                      options={MODULE_CATEGORIES.map((c) => ({
                        value: c.value,
                        label: c.label,
                      }))}
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                    <Input
                      label="Version"
                      value={editVersion}
                      onChange={(e) => setEditVersion(e.target.value)}
                    />
                    <Input
                      label="Icon Name"
                      value={editIconName}
                      onChange={(e) => setEditIconName(e.target.value)}
                    />
                  </div>
                  <IndustrySelect
                    value={editIndustryCode}
                    onChange={setEditIndustryCode}
                    label="Industry"
                    showAll
                  />
                  <Textarea
                    label="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-500">Code</span>
                      <p className="font-mono font-medium">{mod.code}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category</span>
                      <p className="font-medium">{mod.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Version</span>
                      <p className="font-medium">v{mod.version}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Core Module</span>
                      <p className="font-medium">{mod.isCore ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Industry</span>
                      <div className="mt-0.5"><IndustryBadge industryCode={mod.industryCode} /></div>
                    </div>
                    {mod.iconName && (
                      <div>
                        <span className="text-gray-500">Icon</span>
                        <p className="font-medium">{mod.iconName}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Created</span>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(mod.createdAt)}
                      </p>
                    </div>
                  </div>
                  {mod.description && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-500">Description</span>
                      <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                        {mod.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Features ({mod.features?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mod.features && mod.features.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4 font-medium">Code</th>
                        <th className="pb-2 pr-4 font-medium">Name</th>
                        <th className="pb-2 pr-4 font-medium">Type</th>
                        <th className="pb-2 pr-4 font-medium">Menu Key</th>
                        <th className="pb-2 font-medium text-center">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mod.features.map((f) => (
                        <tr key={f.code} className="border-b last:border-0">
                          <td className="py-2.5 pr-4 font-mono text-xs">{f.code}</td>
                          <td className="py-2.5 pr-4">{f.name}</td>
                          <td className="py-2.5 pr-4">
                            <Badge variant="outline" className="text-[10px]">
                              {f.type}
                            </Badge>
                          </td>
                          <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">
                            {f.menuKey ?? '—'}
                          </td>
                          <td className="py-2.5 text-center">
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
                <p className="text-sm text-gray-400 py-4 text-center">
                  No features defined for this module
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dependencies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Dependencies ({mod.dependsOn?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mod.dependsOn && mod.dependsOn.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mod.dependsOn.map((dep) => (
                    <Badge key={dep} variant="secondary" className="font-mono">
                      {dep}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  This module has no dependencies
                </p>
              )}
            </CardContent>
          </Card>

          {/* Menu Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Menu Keys ({mod.menuKeys?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mod.menuKeys && mod.menuKeys.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mod.menuKeys.map((key) => (
                    <Badge key={key} variant="outline" className="font-mono text-xs">
                      {key}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No menu keys assigned
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Pricing Tab ─── */}
      {activeTab === 'Pricing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Pricing Type</span>
                  <p className="font-medium text-base mt-0.5">
                    {PRICING_TYPES.find((p) => p.value === mod.defaultPricingType)?.label ??
                      mod.defaultPricingType}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Base Price</span>
                  <p className="font-medium text-base mt-0.5">
                    {formatCurrency(mod.basePrice ?? 0)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Monthly Price</span>
                  <p className="font-medium text-base mt-0.5">
                    {mod.priceMonthly != null ? `${formatCurrency(mod.priceMonthly)}/mo` : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Yearly Price</span>
                  <p className="font-medium text-base mt-0.5">
                    {mod.priceYearly != null ? `${formatCurrency(mod.priceYearly)}/yr` : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">One-time Setup Fee</span>
                  <p className="font-medium text-base mt-0.5">
                    {mod.oneTimeSetupFee != null ? formatCurrency(mod.oneTimeSetupFee) : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Free in Base Plan</span>
                  <p className="font-medium text-base mt-0.5">
                    {mod.isFreeInBase ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trial Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trial Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Trial Days</span>
                  <p className="font-medium text-base mt-0.5">
                    {mod.trialDays ?? 0} days
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Trial Features</span>
                  {mod.trialFeatures && mod.trialFeatures.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mod.trialFeatures.map((code) => (
                        <Badge key={code} variant="secondary" className="text-[10px] font-mono">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="font-medium text-base mt-0.5 text-gray-400">
                      All features available in trial
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage-Based Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {mod.usagePricing && Object.keys(mod.usagePricing).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 font-medium">Key</th>
                        <th className="pb-2 font-medium text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(mod.usagePricing).map(([key, price]) => (
                        <tr key={key} className="border-b last:border-0">
                          <td className="py-2.5 font-mono">{key}</td>
                          <td className="py-2.5 text-right font-medium">
                            {formatCurrency(price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No usage-based pricing configured
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Subscribers Tab ─── */}
      {activeTab === 'Subscribers' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Subscribers ({subMeta?.total != null ? formatNumber(subMeta.total) : '...'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No subscribers yet
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4 font-medium">Tenant</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 pr-4 font-medium">Enabled At</th>
                        <th className="pb-2 font-medium">Features</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {subscribers.map((sub: any, i: number) => (
                        <tr key={sub.id ?? i} className="border-b last:border-0">
                          <td className="py-2.5 pr-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {sub.tenant?.name ?? sub.tenantId ?? 'Unknown'}
                              </p>
                              {sub.tenant?.domain && (
                                <p className="text-xs text-gray-400">{sub.tenant.domain}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 pr-4">
                            <StatusBadge value={sub.isEnabled ? 'ACTIVE' : 'INACTIVE'} />
                          </td>
                          <td className="py-2.5 pr-4 text-gray-500">
                            {sub.enabledAt ? formatDate(sub.enabledAt) : '—'}
                          </td>
                          <td className="py-2.5">
                            {sub.enabledFeatures && sub.enabledFeatures.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {sub.enabledFeatures.slice(0, 3).map((f: string) => (
                                  <Badge
                                    key={f}
                                    variant="outline"
                                    className="text-[10px] font-mono"
                                  >
                                    {f}
                                  </Badge>
                                ))}
                                {sub.enabledFeatures.length > 3 && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    +{sub.enabledFeatures.length - 3}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">All</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {subMeta?.totalPages && subMeta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                      disabled={subPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {subPage} of {subMeta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubPage((p) => p + 1)}
                      disabled={subPage >= subMeta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
