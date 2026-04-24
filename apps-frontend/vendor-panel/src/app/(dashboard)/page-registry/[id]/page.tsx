'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  FileText,
  Code,
  Link2,
  Tags,
  Globe,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { IndustrySelect } from '@/components/common/industry-select';
import { usePage, useUpdatePage, useAssignPage, useUnassignPage } from '@/hooks/use-page-registry';
import { useModules } from '@/hooks/use-modules';
import { extractList } from '@/lib/utils';
import { toast } from 'sonner';
import type { UpdatePageDto } from '@/types/page-registry';
import type { SoftwareModule } from '@/types/module';

const PAGE_TYPE_OPTIONS = [
  { value: '', label: 'Select Type' },
  { value: 'LIST', label: 'List' },
  { value: 'CREATE', label: 'Create' },
  { value: 'DETAIL', label: 'Detail' },
  { value: 'EDIT', label: 'Edit' },
  { value: 'DASHBOARD', label: 'Dashboard' },
  { value: 'SETTINGS', label: 'Settings' },
  { value: 'REPORT', label: 'Report' },
  { value: 'WIZARD', label: 'Wizard' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select Category' },
  { value: 'CRM', label: 'CRM' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Products', label: 'Products' },
  { value: 'Post-Sales', label: 'Post-Sales' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Tasks', label: 'Tasks' },
  { value: 'Reports', label: 'Reports' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Dashboard', label: 'Dashboard' },
  { value: 'Automation', label: 'Automation' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Marketplace', label: 'Marketplace' },
  { value: 'Vendor', label: 'Vendor' },
  { value: 'Data', label: 'Data' },
  { value: 'Developer', label: 'Developer' },
  { value: 'Other', label: 'Other' },
];

const ICON_OPTIONS = [
  { value: '', label: 'No Icon' },
  { value: 'users', label: 'users' },
  { value: 'user-plus', label: 'user-plus' },
  { value: 'building-2', label: 'building-2' },
  { value: 'file-text', label: 'file-text' },
  { value: 'layout-dashboard', label: 'layout-dashboard' },
  { value: 'bar-chart', label: 'bar-chart' },
  { value: 'settings', label: 'settings' },
  { value: 'list', label: 'list' },
  { value: 'target', label: 'target' },
  { value: 'dollar-sign', label: 'dollar-sign' },
  { value: 'mail', label: 'mail' },
  { value: 'calendar', label: 'calendar' },
  { value: 'check-square', label: 'check-square' },
  { value: 'bell', label: 'bell' },
  { value: 'package', label: 'package' },
  { value: 'shield', label: 'shield' },
  { value: 'database', label: 'database' },
  { value: 'globe', label: 'globe' },
  { value: 'git-branch', label: 'git-branch' },
];

export default function PageDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: res, isLoading } = usePage(params.id);
  const { data: modulesRes } = useModules({ limit: 100 });
  const updateMut = useUpdatePage();
  const assignMut = useAssignPage();
  const unassignMut = useUnassignPage();

  const pg = res?.data;
  const modules: SoftwareModule[] = extractList(modulesRes);

  const [form, setForm] = useState<UpdatePageDto>({});
  const [featureInput, setFeatureInput] = useState('');
  const [endpointInput, setEndpointInput] = useState('');

  useEffect(() => {
    if (pg) {
      setForm({
        friendlyName: pg.friendlyName || '',
        description: pg.description || '',
        pageType: pg.pageType || '',
        category: pg.category || '',
        moduleCode: pg.moduleCode || '',
        industryCode: pg.industryCode || null,
        menuIcon: pg.menuIcon || '',
        menuLabel: pg.menuLabel || '',
        menuParentKey: pg.menuParentKey || '',
        menuSortOrder: pg.menuSortOrder ?? 0,
        showInMenu: pg.showInMenu,
        featuresCovered: pg.featuresCovered || [],
        apiEndpoints: pg.apiEndpoints || [],
      });
    }
  }, [pg]);

  if (isLoading) return <LoadingSpinner />;
  if (!pg) return <div className="text-center py-16 text-gray-500">Page not found</div>;

  const moduleOptions = [
    { value: '', label: 'Unassigned' },
    ...modules.map((m) => ({ value: m.code, label: `${m.name} (${m.code})` })),
  ];

  const handleSave = () => {
    updateMut.mutate(
      { id: pg.id, data: form },
      { onSuccess: () => toast.success('Page updated') },
    );
  };

  const handleAssign = (moduleCode: string) => {
    if (!moduleCode) {
      unassignMut.mutate(pg.id, {
        onSuccess: () => toast.success('Page unassigned from module'),
      });
    } else {
      assignMut.mutate(
        {
          id: pg.id,
          data: {
            moduleCode,
            friendlyName: form.friendlyName || undefined,
            menuIcon: form.menuIcon || undefined,
            menuLabel: form.menuLabel || undefined,
            showInMenu: form.showInMenu,
          },
        },
        { onSuccess: () => toast.success(`Page assigned to ${moduleCode}`) },
      );
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm((f) => ({
        ...f,
        featuresCovered: [...(f.featuresCovered || []), featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (tag: string) => {
    setForm((f) => ({
      ...f,
      featuresCovered: (f.featuresCovered || []).filter((t) => t !== tag),
    }));
  };

  const addEndpoint = () => {
    if (endpointInput.trim()) {
      setForm((f) => ({
        ...f,
        apiEndpoints: [...(f.apiEndpoints || []), endpointInput.trim()],
      }));
      setEndpointInput('');
    }
  };

  const removeEndpoint = (ep: string) => {
    setForm((f) => ({
      ...f,
      apiEndpoints: (f.apiEndpoints || []).filter((e) => e !== ep),
    }));
  };

  const routeDisplay = pg.routePath.includes(':')
    ? pg.routePath.split(':').slice(1).join(':')
    : pg.routePath;

  const previewUrl = pg.portal === 'crm'
    ? `http://localhost:3005${routeDisplay.replace(/:(\w+)/g, 'demo')}`
    : `http://localhost:3006${routeDisplay.replace(/:(\w+)/g, 'demo')}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Page</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={pg.portal === 'crm' ? 'info' : 'secondary'}>
                {pg.portal.toUpperCase()}
              </Badge>
              <code className="text-xs text-gray-500">{routeDisplay}</code>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!pg.hasParams && (
            <Button variant="outline" onClick={() => window.open(previewUrl, '_blank')}>
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          )}
          <Button onClick={handleSave} disabled={updateMut.isPending}>
            <Save className="h-4 w-4" />
            {updateMut.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Auto-discovered info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4 text-gray-400" />
            Auto-Discovered Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">File Path:</span>
              <p className="font-mono text-xs mt-0.5">{pg.filePath}</p>
            </div>
            <div>
              <span className="text-gray-500">Component:</span>
              <p className="font-mono text-xs mt-0.5">{pg.componentName || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Has Params:</span>
              <p className="mt-0.5">{pg.hasParams ? `Yes (${pg.paramNames.join(', ')})` : 'No'}</p>
            </div>
            <div>
              <span className="text-gray-500">Parent Route:</span>
              <p className="mt-0.5">{pg.parentRoute || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Last Scanned:</span>
              <p className="mt-0.5">{pg.lastScannedAt ? new Date(pg.lastScannedAt).toLocaleString() : 'Never'}</p>
            </div>
            <div>
              <span className="text-gray-500">Auto-Discovered:</span>
              <p className="mt-0.5">{pg.isAutoDiscovered ? 'Yes' : 'No (Manual)'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Configurable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            Page Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Friendly Name"
              value={form.friendlyName || ''}
              onChange={(e) => setForm((f) => ({ ...f, friendlyName: e.target.value }))}
              placeholder="e.g. Contact List"
            />
            <Input
              label="Description"
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What does this page do?"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select
              options={PAGE_TYPE_OPTIONS}
              value={form.pageType || ''}
              onChange={(e) => setForm((f) => ({ ...f, pageType: e.target.value }))}
              className="w-full"
            />
            <Select
              options={CATEGORY_OPTIONS}
              value={form.category || ''}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full"
            />
            <IndustrySelect
              value={form.industryCode ?? null}
              onChange={(v) => setForm((f) => ({ ...f, industryCode: v }))}
              label="Industry"
              showAll={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Module Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gray-400" />
            Module Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Module</label>
              <div className="flex gap-2">
                <Select
                  options={moduleOptions}
                  value={form.moduleCode || ''}
                  onChange={(e) => setForm((f) => ({ ...f, moduleCode: e.target.value || null }))}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAssign(form.moduleCode || '')}
                  disabled={assignMut.isPending || unassignMut.isPending}
                >
                  {form.moduleCode ? 'Assign' : 'Unassign'}
                </Button>
              </div>
            </div>
            <Select
              options={ICON_OPTIONS}
              value={form.menuIcon || ''}
              onChange={(e) => setForm((f) => ({ ...f, menuIcon: e.target.value }))}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Menu Label Override"
              value={form.menuLabel || ''}
              onChange={(e) => setForm((f) => ({ ...f, menuLabel: e.target.value }))}
              placeholder="Default: friendly name"
            />
            <Input
              label="Sort Order"
              type="number"
              value={String(form.menuSortOrder ?? 0)}
              onChange={(e) => setForm((f) => ({ ...f, menuSortOrder: Number(e.target.value) }))}
            />
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="showInMenu"
                checked={form.showInMenu ?? true}
                onChange={(e) => setForm((f) => ({ ...f, showInMenu: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="showInMenu" className="text-sm text-gray-700">Show in Menu</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Covered */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tags className="h-4 w-4 text-gray-400" />
            Features Covered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {(form.featuresCovered || []).map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => removeFeature(tag)} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Add feature tag..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addFeature}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            API Endpoints Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 mb-3">
            {(form.apiEndpoints || []).map((ep) => (
              <div key={ep} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5">
                <code className="text-xs text-gray-700">{ep}</code>
                <button onClick={() => removeEndpoint(ep)} className="text-gray-400 hover:text-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={endpointInput}
              onChange={(e) => setEndpointInput(e.target.value)}
              placeholder="e.g. GET /api/v1/contacts"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEndpoint())}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addEndpoint}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview iframe */}
      {!pg.hasParams && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              Page Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src={previewUrl}
              className="w-full h-96 border rounded-lg"
              title={`Preview: ${pg.friendlyName || pg.routePath}`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
