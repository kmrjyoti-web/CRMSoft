'use client';

import { Card, Badge, Icon } from '@/components/ui';
import { useVendorOverview, useVendorMRR, usePlanDistribution, useTenantActivity } from '../hooks/useVendor';
import { formatCurrency, formatPercent, timeAgo } from '../utils/vendor-helpers';
import type { MRRDataPoint, PlanDistributionItem, TenantActivityLogItem } from '../types/vendor.types';

export function VendorDashboard() {
  const { data: overview, isLoading } = useVendorOverview(30);
  const { data: mrrData } = useVendorMRR(180);
  const { data: planDist } = usePlanDistribution();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-gray-100 rounded-lg" />
            <div className="h-64 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const stats = overview?.data ?? {
    totalTenants: 0,
    activeTenants: 0,
    trialTenants: 0,
    suspendedTenants: 0,
    mrr: 0,
    arr: 0,
    newTenants: 0,
    churnRate: 0,
  };

  const mrrPoints: MRRDataPoint[] = Array.isArray(mrrData?.data) ? mrrData.data : [];
  const plans: PlanDistributionItem[] = Array.isArray(planDist?.data) ? planDist.data : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your SaaS platform metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon name="indian-rupee" size={20} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">MRR</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.mrr)}</div>
          <div className="text-sm text-gray-400 mt-1">
            ARR: {formatCurrency(stats.arr)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Icon name="users" size={20} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Active Tenants</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeTenants}</div>
          <div className="text-sm text-gray-400 mt-1">
            of {stats.totalTenants} total
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Icon name="user-plus" size={20} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">New Tenants</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.newTenants}</div>
          <div className="text-sm text-gray-400 mt-1">
            {stats.trialTenants} on trial
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Icon name="trending-down" size={20} className="text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Churn Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatPercent(stats.churnRate)}</div>
          <div className="text-sm text-gray-400 mt-1">
            {stats.suspendedTenants} suspended
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Revenue Trend (MRR)
          </h3>
          {mrrPoints.length > 0 ? (
            <div className="space-y-2">
              {mrrPoints.slice(-6).map((point) => {
                const maxMrr = Math.max(...mrrPoints.map((p) => p.mrr), 1);
                const widthPercent = (point.mrr / maxMrr) * 100;
                return (
                  <div key={point.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 shrink-0">{point.month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-20 text-right">
                      {formatCurrency(point.mrr)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No revenue data available
            </div>
          )}
        </Card>

        {/* Plan Distribution */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Plan Distribution
          </h3>
          {plans.length > 0 ? (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.planCode} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-700">{plan.planName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{plan.count} tenants</Badge>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {formatPercent(plan.percentage)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No plan data available
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
