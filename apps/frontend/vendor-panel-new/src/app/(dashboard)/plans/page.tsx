'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Plus, Search, Users, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { IndustryBadge } from '@/components/common/industry-badge';
import { IndustrySelect } from '@/components/common/industry-select';
import { usePlans } from '@/hooks/use-plans';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency, formatNumber, extractList, extractMeta } from '@/lib/utils';
import type { Plan } from '@/types/plan';

export default function PlansPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: res, isLoading } = usePlans({
    search: debouncedSearch || undefined,
    industryCode: industryFilter || undefined,
    page,
    limit: 12,
  });

  const plans: Plan[] = extractList(res);
  const meta = extractMeta(res);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-sm text-gray-500">Manage pricing plans for your tenants</p>
        </div>
        <Button onClick={() => router.push('/plans/new')}>
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search plans..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
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
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No plans yet"
          description="Create your first subscription plan"
          actionLabel="Create Plan"
          onAction={() => router.push('/plans/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/plans/${plan.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-400">{plan.code}</p>
                    </div>
                  </div>
                  <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{plan.description}</p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <IndustryBadge industryCode={plan.industryCode} />
                  <Badge variant="outline">{plan.interval}</Badge>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {formatNumber(plan.maxUsers ?? 0)} users
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm pt-3 border-t">
                  <span className="text-gray-500">Price</span>
                  <span className="flex items-center gap-1 font-bold text-gray-900">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {formatCurrency(plan.price ?? 0)}
                    <span className="font-normal text-gray-400 text-xs">/{plan.interval?.toLowerCase()}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
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
