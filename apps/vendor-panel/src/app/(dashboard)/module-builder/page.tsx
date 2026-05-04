'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Plus, Search, Users, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { useModules } from '@/hooks/use-modules';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency, formatNumber, extractList } from '@/lib/utils';
import type { SoftwareModule } from '@/types/module';

// ── constants ───────────────────────────────────────────────────────
const DEV_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'PUBLISHED', label: 'Published' },
];

const DEV_STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  TESTING: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
};

function getDevStatus(mod: SoftwareModule): string {
  if (mod.moduleStatus === 'ACTIVE') return 'PUBLISHED';
  if (mod.moduleStatus === 'DEPRECATED') return 'DRAFT';
  return 'TESTING';
}

// ── component ───────────────────────────────────────────────────────
export default function ModuleBuilderPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: res, isLoading } = useModules({ limit: 50 });
  const modules: SoftwareModule[] = extractList(res);

  const filtered = modules.filter((mod) => {
    if (debouncedSearch && !mod.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (statusFilter && getDevStatus(mod) !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Builder</h1>
          <p className="text-sm text-gray-500">Build, test, and publish software modules</p>
        </div>
        <Button onClick={() => router.push('/modules/new')}>
          <Plus className="h-4 w-4" />
          Create Module
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={DEV_STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No modules found"
          description={debouncedSearch || statusFilter ? 'Try adjusting your filters' : 'Create your first module to get started'}
          actionLabel="Create Module"
          onAction={() => router.push('/modules/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mod) => {
            const devStatus = getDevStatus(mod);
            const monthlyRevenue = (Number(mod.priceMonthly ?? mod.basePrice ?? 0)) * (mod._count?.tenantModules ?? 0);

            return (
              <Card
                key={mod.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/module-builder/${mod.id}`)}
              >
                <CardContent className="p-4">
                  {/* Top: icon + name + status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{mod.name}</h3>
                        <p className="text-xs text-gray-400">v{mod.version}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${DEV_STATUS_STYLE[devStatus] ?? 'bg-gray-100 text-gray-800'}`}>
                      {devStatus}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {mod.description || 'No description'}
                  </p>

                  {/* Category */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{mod.category}</Badge>
                  </div>

                  {/* Bottom stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {formatNumber(mod._count?.tenantModules ?? 0)} subs
                    </span>
                    <span className="flex items-center gap-1 font-medium text-gray-900">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {formatCurrency(monthlyRevenue)}/mo
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
