'use client';

import { useRouter } from 'next/navigation';
import {
  Layers, Key, IndianRupee, Users, AlertTriangle, Activity,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useModules } from '@/hooks/use-modules';
import { useLicenses } from '@/hooks/use-licenses';
import { useSystemHealth } from '@/hooks/use-system-health';
import { useErrorStats } from '@/hooks/use-error-logs';
import { useTenants } from '@/hooks/use-tenants';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { data: modulesRes, isLoading: modulesLoading } = useModules({ status: 'ACTIVE', limit: 1 });
  const { data: licensesRes, isLoading: licensesLoading } = useLicenses({ status: 'ACTIVE', limit: 1 });
  const { data: healthRes, isLoading: healthLoading } = useSystemHealth();
  const { data: errorStatsRes, isLoading: errorStatsLoading } = useErrorStats();
  const { data: tenantsRes, isLoading: tenantsLoading } = useTenants({ status: 'ACTIVE', limit: 1 });

  const isLoading = modulesLoading || licensesLoading || healthLoading || errorStatsLoading || tenantsLoading;

  const modulesMeta = modulesRes?.data?.meta;
  const licensesMeta = licensesRes?.data?.meta;
  const health = healthRes?.data;
  const errorStats = errorStatsRes?.data;
  const tenantsMeta = tenantsRes?.data?.meta;

  const kpis = [
    {
      label: 'Active Modules',
      value: formatNumber(modulesMeta?.total ?? 0),
      change: 0,
      icon: Layers,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Active Licenses',
      value: formatNumber(licensesMeta?.total ?? 0),
      change: 0,
      icon: Key,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(0),
      change: 0,
      icon: IndianRupee,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Active Tenants',
      value: formatNumber(tenantsMeta?.total ?? 0),
      change: 0,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Error Rate (24h)',
      value: errorStats ? `${(errorStats.errorRate ?? 0).toFixed(2)}%` : '0%',
      change: errorStats?.trend ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'API Uptime',
      value: health?.api?.uptime != null ? `${(health.api.uptime / 3600).toFixed(1)}h` : '—',
      change: 0,
      icon: Activity,
      color: 'text-teal-600 bg-teal-50',
    },
  ];

  const quickActions = [
    { label: 'View Error Logs', href: '/error-logs', icon: AlertTriangle },
    { label: 'Manage Modules', href: '/modules', icon: Layers },
    { label: 'License Dashboard', href: '/licenses', icon: Key },
    { label: 'System Health', href: '/system-health', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DevOps Overview</h1>
        <p className="text-sm text-gray-500">Platform health, modules, and tenant metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : kpis.map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{kpi.label}</p>
                      <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${kpi.color}`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                  </div>
                  {kpi.change !== 0 && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${kpi.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {kpi.change > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span>{Math.abs(kpi.change).toFixed(1)}% vs last period</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <action.icon className="h-6 w-6 text-gray-600" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
