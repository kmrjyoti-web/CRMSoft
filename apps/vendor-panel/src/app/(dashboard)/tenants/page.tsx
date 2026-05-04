'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { useTenants } from '@/hooks/use-tenants';
import { useDebounce } from '@/hooks/use-debounce';
import { formatNumber, timeAgo, extractList, extractMeta } from '@/lib/utils';
import type { TenantItem, TenantFilters } from '@/types/tenant-item';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'destructive' | 'secondary'> = {
  ACTIVE: 'success',
  TRIAL: 'info',
  SUSPENDED: 'destructive',
  CANCELLED: 'secondary',
};

export default function TenantsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters: TenantFilters = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 20,
  };

  const { data: res, isLoading } = useTenants(filters);

  // Stats queries for each status
  const { data: allRes } = useTenants({ limit: 1 });
  const { data: activeRes } = useTenants({ status: 'ACTIVE', limit: 1 });
  const { data: trialRes } = useTenants({ status: 'TRIAL', limit: 1 });
  const { data: suspendedRes } = useTenants({ status: 'SUSPENDED', limit: 1 });

  const tenants: TenantItem[] = extractList(res);
  const meta = extractMeta(res);

  const statsCards = [
    { label: 'Total Tenants', value: extractMeta(allRes)?.total ?? 0, color: 'text-gray-900' },
    { label: 'Active', value: extractMeta(activeRes)?.total ?? 0, color: 'text-green-600' },
    { label: 'Trial', value: extractMeta(trialRes)?.total ?? 0, color: 'text-blue-600' },
    { label: 'Suspended', value: extractMeta(suspendedRes)?.total ?? 0, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <p className="text-sm text-gray-500">Manage all tenant accounts and subscriptions</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{formatNumber(stat.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : tenants.length === 0 ? (
        <EmptyState icon={Users} title="No tenants" description="No tenants found matching your filters" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Slug</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Plan</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Industry</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Users</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Storage</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">DB Strategy</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((tenant) => {
                const storagePercent = tenant.storageMaxMb > 0
                  ? Math.round((tenant.storageUsedMb / tenant.storageMaxMb) * 100)
                  : 0;
                return (
                  <tr
                    key={tenant.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/tenants/${tenant.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{tenant.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{tenant.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{tenant.planName}</td>
                    <td className="px-4 py-3">
                      <IndustryBadge industryCode={tenant.industryCode} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[tenant.status] ?? 'secondary'} className="text-xs">
                        {tenant.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {tenant.usersCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${storagePercent > 90 ? 'bg-red-500' : storagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(storagePercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{storagePercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{tenant.dbStrategy}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {timeAgo(tenant.lastActiveAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta?.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
