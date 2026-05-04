'use client';

import { useState } from 'react';
import {
  Users,
  UserCheck,
  IndianRupee,
  TrendingUp,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IndustrySelect } from '@/components/common/industry-select';
import { useTenants } from '@/hooks/use-tenants';
import { extractList } from '@/lib/utils';
import type { TenantItem } from '@/types/tenant-item';
import {
  useVendorOverview,
  useVendorMRR,
  useVendorPlanDistribution,
} from '@/hooks/use-vendor-dashboard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function VendorDashboardPage() {
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const dashFilters = industryFilter ? { industryCode: industryFilter } : undefined;
  const { data: overviewRes, isLoading: overviewLoading } = useVendorOverview(dashFilters);
  const { data: mrrRes, isLoading: mrrLoading } = useVendorMRR(dashFilters);
  const { data: distRes, isLoading: distLoading } = useVendorPlanDistribution(dashFilters);
  const { data: tenantsRes } = useTenants({ industryCode: industryFilter || undefined, limit: 500 });

  const overview = overviewRes?.data;
  const mrrData = mrrRes?.data ?? [];
  const distribution = distRes?.data ?? [];

  const kpis = [
    { label: 'Total Tenants', value: formatNumber(overview?.totalTenants ?? 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Tenants', value: formatNumber(overview?.activeTenants ?? 0), icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'MRR', value: formatCurrency(overview?.mrr ?? 0), icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'ARR', value: formatCurrency(overview?.arr ?? 0), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'New Tenants (30d)', value: formatNumber(overview?.newTenants ?? 0), icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Churn Rate', value: `${(overview?.churnRate ?? 0).toFixed(1)}%`, icon: UserMinus, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your SaaS business metrics</p>
        </div>
        <div className="w-52">
          <IndustrySelect
            value={industryFilter}
            onChange={setIndustryFilter}
            label="Filter by Industry"
          />
        </div>
      </div>

      {/* KPI Cards */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">MRR Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {mrrLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mrrData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'MRR']} />
                  <Line type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {distLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="count"
                      nameKey="planName"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {distribution.map((_: unknown, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {distribution.map((d, i) => (
                    <div key={d.planCode} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-600">{d.planName}</span>
                      <span className="font-medium">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Industry Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Industry Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const allTenants: TenantItem[] = extractList(tenantsRes);
            const breakdown = allTenants.reduce<Record<string, number>>((acc, t) => {
              const key = t.industryCode || 'Unassigned';
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {});
            const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

            if (entries.length === 0) {
              return (
                <p className="text-sm text-gray-500">No tenant data available yet. Industry analytics will appear once tenants are onboarded.</p>
              );
            }

            return (
              <div className="space-y-2">
                {entries.map(([industry, count]) => (
                  <div key={industry} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-gray-700">{industry}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{ width: `${Math.round((count / allTenants.length) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-10 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
