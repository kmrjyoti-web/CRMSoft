'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Search, RefreshCw, Calendar, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { useLicenses } from '@/hooks/use-licenses';
import { usePackages } from '@/hooks/use-packages';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDate, extractList } from '@/lib/utils';
import { LICENSE_STATUS } from '@/lib/constants';
import type { License, LicenseFilters } from '@/types/license';
import type { SubscriptionPackage } from '@/types/package';

export default function LicensesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch || undefined,
    status: statusFilter ? (statusFilter as LicenseFilters['status']) : undefined,
    packageId: packageFilter || undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 20,
  };

  const { data: res, isLoading } = useLicenses(filters);
  const { data: pkgRes } = usePackages({ limit: 100 });
  const licenses = extractList<License>(res);
  const packages = extractList<SubscriptionPackage>(pkgRes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Licenses</h1>
        <p className="text-sm text-gray-500">View and monitor all issued licenses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search by tenant name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select
          options={[{ value: '', label: 'All Status' }, ...LICENSE_STATUS.map((s) => ({ value: s.value, label: s.label }))]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
        <Select
          options={[{ value: '', label: 'All Packages' }, ...packages.map((p) => ({ value: p.id, label: p.packageName }))]}
          value={packageFilter}
          onChange={(e) => { setPackageFilter(e.target.value); setPage(1); }}
          className="w-48"
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
      ) : licenses.length === 0 ? (
        <EmptyState icon={Key} title="No licenses found" description="Licenses will appear here when tenants subscribe to packages" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Tenant Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Package</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Industry</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Expiry Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Users</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Auto-Renew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {licenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/licenses/${license.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{license.tenantName ?? '-'}</td>
                  <td className="px-4 py-3 text-sm">{license.packageName ?? '-'}</td>
                  <td className="px-4 py-3">
                    <IndustryBadge industryCode={license.tenantIndustryCode} />
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={license.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {license.expiryDate ? formatDate(license.expiryDate) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      {license.currentUsers ?? 0}/{license.maxUsers ?? '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {license.autoRenew ? (
                      <Badge variant="success" className="text-xs"><RefreshCw className="h-3 w-3 mr-1" />Yes</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">No</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={licenses.length < 20}>Next</Button>
      </div>
    </div>
  );
}
