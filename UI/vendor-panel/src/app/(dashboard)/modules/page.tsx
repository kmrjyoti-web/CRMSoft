'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Plus, Search, Users, IndianRupee, Package, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { useModules } from '@/hooks/use-modules';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency, formatNumber, extractList, extractMeta } from '@/lib/utils';
import { MODULE_CATEGORIES, MODULE_STATUS } from '@/lib/constants';
import type { SoftwareModule, ModuleFilters } from '@/types/module';

const PRICING_LABELS: Record<string, string> = {
  FREE: 'Free',
  INCLUDED: 'Included',
  ADDON: 'Add-on',
  ONE_TIME: 'One-time',
  PER_USAGE: 'Per Usage',
};

export default function ModulesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters: ModuleFilters = {
    search: debouncedSearch || undefined,
    category: categoryFilter ? (categoryFilter as ModuleFilters['category']) : undefined,
    status: statusFilter ? (statusFilter as ModuleFilters['status']) : undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 12,
  };

  const { data: res, isLoading } = useModules(filters);

  const modules: SoftwareModule[] = extractList(res);
  const meta = extractMeta(res);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modules</h1>
          <p className="text-sm text-gray-500">
            Manage your software modules, features and pricing
          </p>
        </div>
        <Button onClick={() => router.push('/modules/new')}>
          <Plus className="h-4 w-4" />
          Create Module
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search modules by name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Categories' },
            ...MODULE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
          ]}
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="w-48"
        />
        <Select
          options={[
            { value: '', label: 'All Status' },
            ...MODULE_STATUS.map((s) => ({ value: s.value, label: s.label })),
          ]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-40"
        />
        <div className="w-48">
          <IndustrySelect
            value={industryFilter}
            onChange={(v) => { setIndustryFilter(v); setPage(1); }}
            label=""
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : modules.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No modules found"
          description={
            debouncedSearch || categoryFilter || statusFilter || industryFilter
              ? 'No modules match the current filters. Try adjusting your search.'
              : 'Create your first software module to get started.'
          }
          actionLabel="Create Module"
          onAction={() => router.push('/modules/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <Card
              key={mod.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/modules/${mod.id}`)}
            >
              <CardContent className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{mod.name}</h3>
                      <Badge variant="outline" className="mt-0.5 text-[10px] font-mono">
                        {mod.code}
                      </Badge>
                    </div>
                  </div>
                  <StatusBadge value={mod.moduleStatus ?? mod.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[2.5rem]">
                  {mod.description || 'No description provided'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <Badge variant="secondary">{mod.category}</Badge>
                  <Badge variant="info">v{mod.version}</Badge>
                  <IndustryBadge industryCode={mod.industryCode} />
                  {mod.defaultPricingType && (
                    <Badge variant="outline">
                      {PRICING_LABELS[mod.defaultPricingType] ?? mod.defaultPricingType}
                    </Badge>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                  <span className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    {mod.features?.length ?? 0} features
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5" />
                    {mod.dependsOn?.length ?? 0} deps
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {formatNumber(mod._count?.tenantModules ?? 0)}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-gray-900">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {formatCurrency(mod.priceMonthly ?? mod.basePrice ?? 0)}/mo
                  </span>
                </div>
              </CardContent>
            </Card>
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
