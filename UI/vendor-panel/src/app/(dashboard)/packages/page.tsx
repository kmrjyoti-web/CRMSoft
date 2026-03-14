'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, Plus, Search, Users, IndianRupee, Layers, Star,
  LayoutGrid, Table as TableIcon, Clock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { usePackages } from '@/hooks/use-packages';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency, formatNumber, extractList, extractMeta, cn } from '@/lib/utils';
import type { PackageFilters, SubscriptionPackage } from '@/types/package';

const TIER_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Free', color: 'bg-gray-100 text-gray-700' },
  1: { label: 'Basic', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Professional', color: 'bg-purple-100 text-purple-700' },
  3: { label: 'Enterprise', color: 'bg-amber-100 text-amber-700' },
};

function TierBadge({ tier }: { tier: number }) {
  const t = TIER_LABELS[tier] ?? { label: `Tier ${tier}`, color: 'bg-gray-100 text-gray-700' };
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', t.color)}>{t.label}</span>;
}

export default function PackagesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filters: PackageFilters = {
    search: debouncedSearch || undefined,
    isActive: isActiveFilter,
    industryCode: industryFilter || undefined,
    page,
    limit: 12,
  };

  const { data: res, isLoading } = usePackages(filters);

  const packages: SubscriptionPackage[] = extractList(res);
  const meta = extractMeta(res);

  const toggleActive = () => {
    setIsActiveFilter((prev) => {
      if (prev === undefined) return true;
      if (prev === true) return false;
      return undefined;
    });
    setPage(1);
  };

  const activeLabel = isActiveFilter === undefined ? 'All' : isActiveFilter ? 'Active' : 'Inactive';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-sm text-gray-500">Manage subscription packages for your tenants</p>
        </div>
        <Button onClick={() => router.push('/packages/new')}>
          <Plus className="h-4 w-4" />
          Create Package
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search packages..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Button variant="outline" size="sm" onClick={toggleActive}>
          {activeLabel === 'Active' && <span className="h-2 w-2 rounded-full bg-green-500" />}
          {activeLabel === 'Inactive' && <span className="h-2 w-2 rounded-full bg-gray-400" />}
          {activeLabel}
        </Button>
        <div className="w-48">
          <IndustrySelect
            value={industryFilter}
            onChange={(v) => { setIndustryFilter(v); setPage(1); }}
            label=""
          />
        </div>
        <div className="flex items-center border rounded-md">
          <button
            className={cn('p-2 transition-colors', view === 'cards' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700')}
            onClick={() => setView('cards')}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            className={cn('p-2 transition-colors', view === 'table' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700')}
            onClick={() => setView('table')}
            title="Table view"
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No packages yet"
          description="Create your first subscription package to get started"
          actionLabel="Create Package"
          onAction={() => router.push('/packages/new')}
        />
      ) : view === 'cards' ? (
        /* ── Card Grid (Pricing Page Style) ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                'cursor-pointer hover:shadow-lg transition-all relative overflow-hidden',
                pkg.isPopular && 'ring-2 ring-yellow-400',
              )}
              onClick={() => router.push(`/packages/${pkg.id}`)}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {pkg.badgeText || 'Popular'}
                  </div>
                </div>
              )}
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{pkg.packageName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <TierBadge tier={pkg.tier} />
                    {pkg.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <IndustryBadge industryCode={pkg.industryCode} />
                  </div>
                  {pkg.tagline && (
                    <p className="text-sm text-gray-500 mt-2">{pkg.tagline}</p>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-1 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-4 w-4 text-gray-400 shrink-0 self-center" />
                    <span className="text-2xl font-bold text-primary">{formatCurrency(pkg.priceMonthlyInr)}</span>
                    <span className="text-sm text-gray-400">/month</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 text-gray-300" />
                    <span className="text-sm text-gray-500">{formatCurrency(pkg.priceYearlyInr)}</span>
                    <span className="text-xs text-gray-400">/year</span>
                    {pkg.yearlyDiscountPct > 0 && (
                      <Badge variant="success" className="ml-1 text-[10px] px-1.5">
                        Save {pkg.yearlyDiscountPct}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {formatNumber(pkg._count?.packageModules ?? pkg.packageModules?.length ?? 0)} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {pkg.trialDays} day trial
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {/* subscriber count from _count or fallback */}
                    {formatNumber(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (pkg as any)._count?.subscriptions ?? 0,
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ── Table View ── */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-600">Package</th>
                  <th className="text-left p-3 font-medium text-gray-600">Tier</th>
                  <th className="text-right p-3 font-medium text-gray-600">Monthly</th>
                  <th className="text-right p-3 font-medium text-gray-600">Yearly</th>
                  <th className="text-center p-3 font-medium text-gray-600">Modules</th>
                  <th className="text-center p-3 font-medium text-gray-600">Trial</th>
                  <th className="text-center p-3 font-medium text-gray-600">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600">Industry</th>
                  <th className="text-center p-3 font-medium text-gray-600">Popular</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/packages/${pkg.id}`)}
                  >
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-gray-900">{pkg.packageName}</p>
                        {pkg.tagline && <p className="text-xs text-gray-400 truncate max-w-[200px]">{pkg.tagline}</p>}
                      </div>
                    </td>
                    <td className="p-3"><TierBadge tier={pkg.tier} /></td>
                    <td className="p-3 text-right font-medium">{formatCurrency(pkg.priceMonthlyInr)}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(pkg.priceYearlyInr)}</td>
                    <td className="p-3 text-center">{pkg._count?.packageModules ?? pkg.packageModules?.length ?? 0}</td>
                    <td className="p-3 text-center">{pkg.trialDays}d</td>
                    <td className="p-3 text-center">
                      {pkg.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                    </td>
                    <td className="p-3">
                      <IndustryBadge industryCode={pkg.industryCode} />
                    </td>
                    <td className="p-3 text-center">
                      {pkg.isPopular && <Star className="h-4 w-4 text-yellow-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {meta?.totalPages && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {page} of {meta.totalPages}
            {meta.total !== undefined && <span className="ml-1 text-gray-400">({formatNumber(meta.total)} total)</span>}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (meta.totalPages ?? 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
