'use client';

import { useState } from 'react';
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useWalletSummary,
  useSpendByCategory,
  useDailyTrend,
  useTopServices,
} from '@/hooks/use-wallet-analytics';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

export default function WalletAnalyticsPage() {
  const [period, setPeriod] = useState('30d');

  const { data: overviewRes, isLoading: overviewLoading } = useWalletSummary(period);
  const { data: categoryRes, isLoading: categoryLoading } = useSpendByCategory(period);
  const { data: trendRes, isLoading: trendLoading } = useDailyTrend(period);
  const { data: servicesRes, isLoading: servicesLoading } = useTopServices(period);

  const overview = overviewRes?.data;
  const categoryData = categoryRes?.data ?? [];
  const trendData = trendRes?.data ?? [];
  const topServices = servicesRes?.data ?? [];

  const kpis = [
    { label: 'Total Recharged', value: formatCurrency(overview?.totalRecharged ?? 0), icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Spent', value: formatCurrency(overview?.totalSpent ?? 0), icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Active Wallets', value: formatNumber(overview?.activeWallets ?? 0), icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Analytics</h1>
          <p className="text-sm text-gray-500">Token usage and spend analytics across tenants</p>
        </div>
        <Select
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-40"
        />
      </div>

      {/* KPI Cards */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spend Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              Daily Spend Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatNumber(Number(value)) + ' tokens', 'Spent']} />
                  <Area
                    type="monotone"
                    dataKey="spent"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#spendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Spend by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="tokens"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {categoryData.map((_: unknown, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(Number(value)) + ' tokens']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryData.map((d: { category: string; tokens: number }, i: number) => (
                    <div key={d.category} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-600">{d.category}</span>
                      <span className="font-medium">{formatNumber(d.tokens)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Services by Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {servicesLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => formatNumber(v)} />
                <YAxis type="category" dataKey="service" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value) => [formatNumber(Number(value)) + ' tokens', 'Usage']} />
                <Bar dataKey="tokens" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
