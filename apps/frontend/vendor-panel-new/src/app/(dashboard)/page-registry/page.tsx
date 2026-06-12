'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  RefreshCw,
  Eye,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { usePages, usePageStats, useScanPages } from '@/hooks/use-page-registry';
import { useDebounce } from '@/hooks/use-debounce';
import { formatNumber, extractList, extractMeta } from '@/lib/utils';
import { toast } from 'sonner';
import type { PageRegistryItem, PageFilters } from '@/types/page-registry';

const PORTAL_OPTIONS = [
  { value: '', label: 'All Portals' },
  { value: 'crm', label: 'CRM Portal' },
  { value: 'vendor', label: 'Vendor Portal' },
];

const PAGE_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'LIST', label: 'List' },
  { value: 'CREATE', label: 'Create' },
  { value: 'DETAIL', label: 'Detail' },
  { value: 'EDIT', label: 'Edit' },
  { value: 'DASHBOARD', label: 'Dashboard' },
  { value: 'SETTINGS', label: 'Settings' },
  { value: 'REPORT', label: 'Report' },
  { value: 'WIZARD', label: 'Wizard' },
];

const TYPE_COLORS: Record<string, string> = {
  LIST: 'bg-blue-100 text-blue-800',
  CREATE: 'bg-green-100 text-green-800',
  DETAIL: 'bg-purple-100 text-purple-800',
  EDIT: 'bg-yellow-100 text-yellow-800',
  DASHBOARD: 'bg-indigo-100 text-indigo-800',
  SETTINGS: 'bg-gray-100 text-gray-800',
  REPORT: 'bg-orange-100 text-orange-800',
  WIZARD: 'bg-pink-100 text-pink-800',
};

function getStatusColor(page: PageRegistryItem): string {
  if (page.moduleCode && page.friendlyName) return 'border-l-green-500';
  if (page.moduleCode) return 'border-l-yellow-500';
  return 'border-l-red-400';
}

export default function PageRegistryPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [portalFilter, setPortalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters: PageFilters = {
    search: debouncedSearch || undefined,
    portal: portalFilter || undefined,
    pageType: typeFilter || undefined,
    moduleCode: moduleFilter || undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 50,
  };

  const { data: res, isLoading } = usePages(filters);
  const { data: statsRes } = usePageStats();
  const scanMut = useScanPages();

  const pages: PageRegistryItem[] = extractList(res);
  const meta = extractMeta(res);
  const stats = statsRes?.data;

  const handleScan = () => {
    scanMut.mutate(undefined, {
      onSuccess: (result) => {
        const d = result?.data;
        toast.success(`Scanned ${d?.total ?? 0} pages (${d?.created ?? 0} new, ${d?.updated ?? 0} updated)`);
      },
    });
  };

  // Get unique module codes from stats for filter dropdown
  const moduleOptions = [
    { value: '', label: 'All Modules' },
    { value: '__unassigned__', label: 'Unassigned' },
    ...(stats?.byModule?.map((m) => ({
      value: m.moduleCode || '',
      label: m.moduleCode || 'Unknown',
    })) || []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Registry</h1>
          <p className="text-sm text-gray-500">
            Auto-discovered routes from all portals — assign to modules and configure menus
          </p>
        </div>
        <Button onClick={handleScan} disabled={scanMut.isPending}>
          <RefreshCw className={`h-4 w-4 ${scanMut.isPending ? 'animate-spin' : ''}`} />
          {scanMut.isPending ? 'Scanning...' : 'Re-scan Routes'}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Pages', value: stats.total, color: 'text-blue-600' },
            { label: 'Unassigned', value: stats.unassigned, color: 'text-red-600' },
            { label: 'CRM Pages', value: stats.byPortal.find((p) => p.portal === 'crm')?.count ?? 0, color: 'text-indigo-600' },
            { label: 'Vendor Pages', value: stats.byPortal.find((p) => p.portal === 'vendor')?.count ?? 0, color: 'text-purple-600' },
            { label: 'Modules', value: stats.byModule.length, color: 'text-green-600' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{formatNumber(s.value)}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search by name, route, or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          options={PORTAL_OPTIONS}
          value={portalFilter}
          onChange={(e) => { setPortalFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Select
          options={PAGE_TYPE_OPTIONS}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="w-36"
        />
        <Select
          options={moduleOptions}
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value === '__unassigned__' ? '' : e.target.value);
            setPage(1);
          }}
          className="w-44"
        />
        <div className="w-44">
          <IndustrySelect
            value={industryFilter}
            onChange={(v) => { setIndustryFilter(v); setPage(1); }}
            label=""
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pages found"
          description={
            debouncedSearch || portalFilter || typeFilter
              ? 'No pages match the current filters.'
              : 'Click "Re-scan Routes" to discover all pages.'
          }
          actionLabel="Scan Routes"
          onAction={handleScan}
        />
      ) : (
        <div className="space-y-1.5">
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Route / Name</div>
            <div className="col-span-1">Portal</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Industry</div>
            <div className="col-span-1">Category</div>
            <div className="col-span-2">Module</div>
            <div className="col-span-1">Menu</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {pages.map((pg) => (
            <div
              key={pg.id}
              className={`grid grid-cols-12 gap-3 items-center px-4 py-3 bg-white rounded-lg border border-l-4 hover:shadow-sm transition-shadow cursor-pointer ${getStatusColor(pg)}`}
              onClick={() => router.push(`/page-registry/${pg.id}`)}
            >
              {/* Route / Name */}
              <div className="col-span-3 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {pg.friendlyName || pg.routePath.split(':')[1] || pg.routePath}
                </p>
                <p className="text-xs text-gray-400 font-mono truncate">
                  {pg.routePath.includes(':') ? pg.routePath.split(':').slice(1).join(':') : pg.routePath}
                </p>
              </div>

              {/* Portal */}
              <div className="col-span-1">
                <Badge variant={pg.portal === 'crm' ? 'info' : 'secondary'} className="text-[10px]">
                  {pg.portal.toUpperCase()}
                </Badge>
              </div>

              {/* Type */}
              <div className="col-span-1">
                {pg.pageType ? (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_COLORS[pg.pageType] || 'bg-gray-100 text-gray-800'}`}>
                    {pg.pageType}
                  </span>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </div>

              {/* Industry */}
              <div className="col-span-1">
                <IndustryBadge industryCode={pg.industryCode} />
              </div>

              {/* Category */}
              <div className="col-span-1">
                <span className="text-sm text-gray-600 truncate">{pg.category || '—'}</span>
              </div>

              {/* Module */}
              <div className="col-span-2">
                {pg.moduleCode ? (
                  <Badge variant="success" className="text-[10px]">{pg.moduleCode}</Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px]">Unassigned</Badge>
                )}
              </div>

              {/* Menu */}
              <div className="col-span-1">
                {pg.showInMenu && !pg.hasParams ? (
                  <span className="text-green-600 text-sm">Yes</span>
                ) : (
                  <span className="text-gray-300 text-sm">No</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => router.push(`/page-registry/${pg.id}`)}
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {!pg.hasParams && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      const route = pg.routePath.includes(':')
                        ? pg.routePath.split(':').slice(1).join(':')
                        : pg.routePath;
                      const baseUrl = pg.portal === 'crm' ? 'http://localhost:3005' : 'http://localhost:3006';
                      window.open(`${baseUrl}${route}`, '_blank');
                    }}
                    title="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta?.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {meta.totalPages}
            {meta.total != null && (
              <span className="text-gray-400 ml-1">({formatNumber(meta.total)} total)</span>
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
