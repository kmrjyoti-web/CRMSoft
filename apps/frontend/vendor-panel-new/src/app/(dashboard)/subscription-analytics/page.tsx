'use client';

import { useState } from 'react';
import {
  IndianRupee,
  Users,
  TrendingDown,
  ArrowRightLeft,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── placeholder data ────────────────────────────────────────────────
const mrrTrend = [
  { month: 'Oct', mrr: 120000 },
  { month: 'Nov', mrr: 135000 },
  { month: 'Dec', mrr: 142000 },
  { month: 'Jan', mrr: 158000 },
  { month: 'Feb', mrr: 171000 },
  { month: 'Mar', mrr: 186000 },
];

const packagePopularity = [
  { name: 'Starter', value: 42, color: '#3b82f6' },
  { name: 'Professional', value: 35, color: '#8b5cf6' },
  { name: 'Enterprise', value: 18, color: '#f59e0b' },
  { name: 'Custom', value: 5, color: '#10b981' },
];

const moduleAdoption = [
  { module: 'Leads', adoption: 92 },
  { module: 'Contacts', adoption: 88 },
  { module: 'Invoicing', adoption: 76 },
  { module: 'Calendar', adoption: 65 },
  { module: 'Workflows', adoption: 54 },
  { module: 'Reports', adoption: 48 },
  { module: 'Email', adoption: 41 },
  { module: 'Marketplace', adoption: 22 },
];

const revenuePerModule = [
  { module: 'Leads', subscribers: 184, monthlyRevenue: 46000, growth: 12.3 },
  { module: 'Contacts', subscribers: 176, monthlyRevenue: 35200, growth: 8.1 },
  { module: 'Invoicing', subscribers: 152, monthlyRevenue: 60800, growth: 15.7 },
  { module: 'Calendar', subscribers: 130, monthlyRevenue: 19500, growth: 6.2 },
  { module: 'Workflows', subscribers: 108, monthlyRevenue: 32400, growth: 22.5 },
  { module: 'Reports', subscribers: 96, monthlyRevenue: 28800, growth: 9.8 },
];

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
];

// ── component ───────────────────────────────────────────────────────
export default function SubscriptionAnalyticsPage() {
  const [period, setPeriod] = useState('30d');

  const heroCards = [
    {
      label: 'Monthly Recurring Revenue',
      value: formatCurrency(186000),
      icon: IndianRupee,
      color: 'text-green-600 bg-green-50',
      delta: '+8.8%',
    },
    {
      label: 'Active Subscribers',
      value: formatNumber(200),
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      delta: '+12',
    },
    {
      label: 'Churn Rate',
      value: '2.4%',
      icon: TrendingDown,
      color: 'text-red-600 bg-red-50',
      delta: '-0.3%',
    },
    {
      label: 'Trial → Paid Conversion',
      value: '38%',
      icon: ArrowRightLeft,
      color: 'text-purple-600 bg-purple-50',
      delta: '+4.1%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Analytics</h1>
          <p className="text-sm text-gray-500">Revenue, churn, and module adoption insights</p>
        </div>
        <Select
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-44"
        />
      </div>

      {/* Hero cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {heroCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{card.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold">{card.value}</p>
                  <span className="text-xs text-green-600 font-medium">{card.delta}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">MRR Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {mrrTrend.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mrrTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis
                    fontSize={12}
                    tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={((v: number) => formatCurrency(v)) as never} />
                  <Line
                    type="monotone"
                    dataKey="mrr"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="MRR"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Package popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Package Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            {packagePopularity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={packagePopularity}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={(({ name, percent }: { name: string; percent: number }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    ) as never}
                    labelLine={false}
                  >
                    {packagePopularity.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module adoption bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            Module Adoption
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moduleAdoption.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={moduleAdoption} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} fontSize={12} />
                <YAxis type="category" dataKey="module" width={90} fontSize={12} />
                <Tooltip formatter={((v: number) => `${v}%`) as never} />
                <Bar dataKey="adoption" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Adoption %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Revenue per module table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue per Module</CardTitle>
        </CardHeader>
        <CardContent>
          {revenuePerModule.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Module</th>
                    <th className="pb-2 font-medium text-right">Subscribers</th>
                    <th className="pb-2 font-medium text-right">Monthly Revenue</th>
                    <th className="pb-2 font-medium text-right">Growth %</th>
                  </tr>
                </thead>
                <tbody>
                  {revenuePerModule.map((row) => (
                    <tr key={row.module} className="border-b last:border-0">
                      <td className="py-2.5 font-medium text-gray-900">{row.module}</td>
                      <td className="py-2.5 text-right">{formatNumber(row.subscribers)}</td>
                      <td className="py-2.5 text-right">{formatCurrency(row.monthlyRevenue)}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant={row.growth >= 10 ? 'success' : 'secondary'}>
                          +{row.growth}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
