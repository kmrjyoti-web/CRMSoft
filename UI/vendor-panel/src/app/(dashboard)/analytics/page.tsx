'use client';

import { useState } from 'react';
import {
  IndianRupee, ShoppingCart, Eye, ArrowUpRight, ArrowDownRight, MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticsOverview, useRevenueData, useListingPerformance } from '@/hooks/use-analytics';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const PERIOD_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data: overviewRes, isLoading: loadingOverview } = useAnalyticsOverview(days);
  const { data: revenueRes, isLoading: loadingRevenue } = useRevenueData(days);
  const { data: perfRes, isLoading: loadingPerf } = useListingPerformance(10);

  const overview = overviewRes?.data;
  const revenueData = Array.isArray(revenueRes?.data) ? revenueRes.data : [];
  const topListings = Array.isArray(perfRes?.data) ? perfRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Your marketplace performance</p>
        </div>
        <Select
          options={PERIOD_OPTIONS}
          value={String(days)}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-40"
        />
      </div>

      {/* KPI Cards */}
      {loadingOverview ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: formatCurrency(overview.totalRevenue), change: overview.revenueGrowth, icon: IndianRupee, color: 'text-green-600 bg-green-50' },
            { label: 'Orders', value: formatNumber(overview.totalOrders), change: overview.ordersGrowth, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
            { label: 'Listing Views', value: formatNumber(overview.listingViews), change: overview.viewsGrowth, icon: Eye, color: 'text-purple-600 bg-purple-50' },
            { label: 'Enquiries', value: formatNumber(overview.newEnquiries), change: 0, icon: MessageSquare, color: 'text-orange-600 bg-orange-50' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                    <p className="text-xl font-bold">{kpi.value}</p>
                  </div>
                </div>
                {kpi.change !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 text-xs ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(kpi.change).toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          {loadingRevenue ? (
            <Skeleton className="h-72 w-full" />
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400">No revenue data available</div>
          )}
        </CardContent>
      </Card>

      {/* Top Listings */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Top Performing Listings</CardTitle></CardHeader>
        <CardContent>
          {loadingPerf ? (
            <Skeleton className="h-64 w-full" />
          ) : topListings.length > 0 ? (
            <div className="space-y-3">
              {topListings.map((item, i) => (
                <div key={item.listingId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <span>{formatNumber(item.views)} views</span>
                      <span>{formatNumber(item.enquiries)} enquiries</span>
                      <span>{formatNumber(item.orders)} orders</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No listing data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
