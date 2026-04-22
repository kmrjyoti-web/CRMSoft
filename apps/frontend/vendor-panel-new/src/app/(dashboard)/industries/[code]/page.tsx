'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Factory,
  Layers,
  Users,
  FileText,
  Activity,
  Settings2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useIndustry, useUpdateIndustry } from '@/hooks/use-industries';
import type { IndustryType } from '@/lib/api/industries';

interface ExtraField {
  field: string;
  label: string;
  type: string;
  options?: string[];
}

interface RegistrationField {
  field: string;
  label: string;
  type: string;
  required?: boolean;
}

interface IndustryPackageItem {
  id: string;
  packageId: string;
  isRecommended?: boolean;
  sortOrder?: number;
  package?: { packageName: string; packageCode?: string };
}

// ─── Tab types ───
type TabKey = 'overview' | 'modules' | 'terminology' | 'fields' | 'stages' | 'activities' | 'registration' | 'widgets' | 'packages';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: FileText },
  { key: 'modules', label: 'Modules', icon: Layers },
  { key: 'terminology', label: 'Terminology', icon: Settings2 },
  { key: 'fields', label: 'Extra Fields', icon: Activity },
  { key: 'stages', label: 'Lead Stages', icon: Users },
  { key: 'activities', label: 'Activity Types', icon: Activity },
  { key: 'registration', label: 'Registration', icon: FileText },
  { key: 'widgets', label: 'Widgets', icon: Layers },
  { key: 'packages', label: 'Packages', icon: Settings2 },
];

export default function IndustryDetailPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = useIndustry(params.code);
  const updateMut = useUpdateIndustry();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const industry = res?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="text-center py-20">
        <Factory className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-700">Industry not found</h2>
        <p className="text-sm text-gray-500 mt-1">Code: {params.code}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/industries')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Industries
        </Button>
      </div>
    );
  }

  const handleToggleActive = async () => {
    try {
      await updateMut.mutateAsync({
        code: industry.typeCode,
        data: { isActive: !industry.isActive },
      });
      toast.success(`Industry ${industry.isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/industries')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{industry.typeName}</h1>
              <Badge variant={industry.isActive ? 'success' : 'secondary'}>
                {industry.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {industry.isDefault && <Badge variant="info">Default</Badge>}
            </div>
            <p className="text-sm text-gray-500 font-mono mt-0.5">{industry.typeCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
            loading={updateMut.isPending}
          >
            {industry.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {industry.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab industry={industry} />}
      {activeTab === 'modules' && <ModulesTab industry={industry} />}
      {activeTab === 'terminology' && <TerminologyTab industry={industry} />}
      {activeTab === 'fields' && <FieldsTab industry={industry} />}
      {activeTab === 'stages' && <StagesTab industry={industry} />}
      {activeTab === 'activities' && <ActivityTypesTab industry={industry} />}
      {activeTab === 'registration' && <RegistrationFieldsTab industry={industry} />}
      {activeTab === 'widgets' && <WidgetsTab industry={industry} />}
      {activeTab === 'packages' && <PackagesTab industry={industry} />}
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ industry }: { industry: IndustryType }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Info */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium">{industry.typeName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Code</dt>
              <dd className="text-sm font-mono text-gray-600">{industry.typeCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Category</dt>
              <dd><Badge variant="secondary">{industry.industryCategory}</Badge></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Color Theme</dt>
              <dd className="text-sm">{industry.colorTheme || 'None'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Icon</dt>
              <dd className="text-sm font-mono">{industry.icon || 'Default'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Sort Order</dt>
              <dd className="text-sm">{industry.sortOrder}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {industry.description || 'No description provided.'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {industry.defaultModules?.length ?? 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Default Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {industry.recommendedModules?.length ?? 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Recommended</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {industry.excludedModules?.length ?? 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Excluded</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Widgets */}
      {industry.dashboardWidgets?.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Dashboard Widgets</h3>
            <div className="flex flex-wrap gap-2">
              {industry.dashboardWidgets.map((w: string) => (
                <Badge key={w} variant="secondary" className="text-xs font-mono">
                  {w}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Templates */}
      {industry.workflowTemplates?.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Workflow Templates</h3>
            <div className="flex flex-wrap gap-2">
              {industry.workflowTemplates.map((w: string) => (
                <Badge key={w} variant="secondary" className="text-xs font-mono">
                  {w}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Modules Tab ───
function ModulesTab({ industry }: { industry: IndustryType }) {
  const sections = [
    { title: 'Default Modules', key: 'defaultModules' as const, color: 'bg-blue-100 text-blue-800' },
    { title: 'Recommended Modules', key: 'recommendedModules' as const, color: 'bg-green-100 text-green-800' },
    { title: 'Excluded Modules', key: 'excludedModules' as const, color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const modules: string[] = industry[section.key] ?? [];
        return (
          <Card key={section.key}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{section.title}</h3>
                <span className="text-xs text-gray-400">{modules.length} modules</span>
              </div>
              {modules.length === 0 ? (
                <p className="text-sm text-gray-400 italic">None configured</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {modules.map((mod: string) => (
                    <span
                      key={mod}
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${section.color}`}
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Terminology Tab ───
function TerminologyTab({ industry }: { industry: IndustryType }) {
  const termMap: Record<string, string> = industry.terminologyMap ?? {};
  const entries = Object.entries(termMap);

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Terminology Map ({entries.length} entries)
        </h3>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No terminology overrides configured.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-mono text-gray-500">{key}</span>
                <span className="text-sm font-medium text-gray-900">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Extra Fields Tab ───
function FieldsTab({ industry }: { industry: IndustryType }) {
  const extraFields: Record<string, ExtraField[]> = (industry.extraFields ?? {}) as Record<string, ExtraField[]>;
  const entities = Object.entries(extraFields);

  return (
    <div className="space-y-6">
      {entities.length === 0 ? (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-400 italic">No extra fields configured.</p>
          </CardContent>
        </Card>
      ) : (
        entities.map(([entity, fields]) => (
          <Card key={entity}>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
                {entity} Fields
                <span className="text-gray-400 font-normal ml-2">({fields.length})</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">Field</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Label</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Type</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f) => (
                      <tr key={f.field} className="border-b border-gray-50">
                        <td className="py-2 font-mono text-gray-600">{f.field}</td>
                        <td className="py-2">{f.label}</td>
                        <td className="py-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {f.type}
                          </Badge>
                        </td>
                        <td className="py-2 text-gray-400 text-xs">
                          {f.options ? f.options.join(', ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Activity Types Tab ───
function ActivityTypesTab({ industry }: { industry: IndustryType }) {
  const activityTypes: string[] = industry.defaultActivityTypes ?? [];

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Default Activity Types
          <span className="text-gray-400 font-normal ml-2">({activityTypes.length})</span>
        </h3>
        {activityTypes.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Using system default activity types.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activityTypes.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Registration Fields Tab ───
function RegistrationFieldsTab({ industry }: { industry: IndustryType }) {
  const fields = (industry.registrationFields ?? []) as unknown as RegistrationField[];

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Registration Fields
          <span className="text-gray-400 font-normal ml-2">({fields.length})</span>
        </h3>
        {fields.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No extra registration fields configured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Field</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Label</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Type</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Required</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.field} className="border-b border-gray-50">
                    <td className="py-2 font-mono text-gray-600">{f.field}</td>
                    <td className="py-2">{f.label}</td>
                    <td className="py-2">
                      <Badge variant="secondary" className="text-[10px]">{f.type}</Badge>
                    </td>
                    <td className="py-2">
                      {f.required ? (
                        <Badge variant="warning" className="text-[10px]">Required</Badge>
                      ) : (
                        <span className="text-gray-400">Optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Widgets Tab ───
function WidgetsTab({ industry }: { industry: IndustryType }) {
  const widgets: string[] = industry.dashboardWidgets ?? [];

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Dashboard Widgets
          <span className="text-gray-400 font-normal ml-2">({widgets.length})</span>
        </h3>
        {widgets.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No dashboard widgets configured.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {widgets.map((w) => (
              <Badge key={w} variant="secondary" className="text-xs font-mono">
                {w}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Packages Tab ───
function PackagesTab({ industry }: { industry: IndustryType }) {
  const packages: IndustryPackageItem[] = (industry as IndustryType & { industryPackages?: IndustryPackageItem[] }).industryPackages ?? [];

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Assigned Packages
          <span className="text-gray-400 font-normal ml-2">({packages.length})</span>
        </h3>
        {packages.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No packages assigned to this industry.</p>
        ) : (
          <div className="space-y-2">
            {packages.map((ip) => (
              <div
                key={ip.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
              >
                <div>
                  <span className="text-sm font-medium">{ip.package?.packageName ?? ip.packageId}</span>
                  {ip.package?.packageCode && (
                    <span className="text-xs text-gray-400 font-mono ml-2">{ip.package.packageCode}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {ip.isRecommended && (
                    <Badge variant="success" className="text-[10px]">Recommended</Badge>
                  )}
                  <span className="text-xs text-gray-400">Order: {ip.sortOrder}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Stages Tab ───
function StagesTab({ industry }: { industry: IndustryType }) {
  const stages: string[] = industry.defaultLeadStages ?? [];

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Default Lead Stages
          <span className="text-gray-400 font-normal ml-2">({stages.length})</span>
        </h3>
        {stages.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Using system default stages.</p>
        ) : (
          <ol className="space-y-1.5">
            {stages.map((stage, idx) => (
              <li key={stage} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}.</span>
                <span className="text-sm">{stage}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
