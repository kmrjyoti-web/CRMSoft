'use client';

import { useRouter } from 'next/navigation';
import {
  Package, ShoppingCart, MessageSquare, TrendingUp, Eye, IndianRupee,
  ArrowUpRight, ArrowDownRight, Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalyticsOverview } from '@/hooks/use-analytics';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { data: overviewRes, isLoading } = useAnalyticsOverview(30);
  const overview = overviewRes?.data;

  const kpis = overview
    ? [
        { label: 'Revenue (30d)', value: formatCurrency(overview.totalRevenue), change: overview.revenueGrowth, icon: IndianRupee, color: 'text-green-600 bg-green-50' },
        { label: 'Orders', value: formatNumber(overview.totalOrders), change: overview.ordersGrowth, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
        { label: 'Active Listings', value: formatNumber(overview.activeListings), change: 0, icon: Package, color: 'text-purple-600 bg-purple-50' },
        { label: 'Listing Views', value: formatNumber(overview.listingViews), change: overview.viewsGrowth, icon: Eye, color: 'text-orange-600 bg-orange-50' },
        { label: 'Enquiries', value: formatNumber(overview.newEnquiries), change: 0, icon: MessageSquare, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Avg Order Value', value: formatCurrency(overview.averageOrderValue), change: 0, icon: TrendingUp, color: 'text-teal-600 bg-teal-50' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Your marketplace overview</p>
        </div>
        <Button onClick={() => router.push('/listings/new')}>
          <Plus className="h-4 w-4" />
          New Listing
        </Button>
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
                    <div className={`flex items-center gap-1 mt-2 text-sm ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            {[
              { label: 'Create Listing', href: '/listings/new', icon: Package },
              { label: 'View Orders', href: '/orders', icon: ShoppingCart },
              { label: 'Check Enquiries', href: '/enquiries', icon: MessageSquare },
              { label: 'View Analytics', href: '/analytics', icon: TrendingUp },
            ].map((action) => (
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
