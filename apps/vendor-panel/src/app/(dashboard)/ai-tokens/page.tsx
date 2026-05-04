'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Brain,
  Coins,
  Gauge,
  Percent,
  Settings,
  Search,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { EmptyState } from '@/components/common/empty-state';
import { useDebounce } from '@/hooks/use-debounce';
import { formatNumber } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── mock data ───────────────────────────────────────────────────────
const overviewData = {
  totalAllocated: 5000000,
  totalConsumed: 3120000,
  remaining: 1880000,
  marginPercent: 32,
  costPerToken: 0.002,
  sellPricePerToken: 0.005,
};

const usageTrend = [
  { date: 'Mar 1', tokens: 95000 },
  { date: 'Mar 2', tokens: 112000 },
  { date: 'Mar 3', tokens: 87000 },
  { date: 'Mar 4', tokens: 145000 },
  { date: 'Mar 5', tokens: 132000 },
  { date: 'Mar 6', tokens: 108000 },
  { date: 'Mar 7', tokens: 124000 },
  { date: 'Mar 8', tokens: 156000 },
  { date: 'Mar 9', tokens: 139000 },
];

const tenantUsage = [
  { id: '1', tenantName: 'Acme Corp', tokensUsed: 620000, tokensLimit: 1000000, lastUsed: '2026-03-09T10:30:00Z' },
  { id: '2', tenantName: 'TechFlow Inc', tokensUsed: 480000, tokensLimit: 750000, lastUsed: '2026-03-09T09:15:00Z' },
  { id: '3', tenantName: 'GreenLeaf', tokensUsed: 310000, tokensLimit: 500000, lastUsed: '2026-03-08T18:45:00Z' },
  { id: '4', tenantName: 'DataBridge', tokensUsed: 890000, tokensLimit: 1000000, lastUsed: '2026-03-09T11:00:00Z' },
  { id: '5', tenantName: 'SkyHigh SaaS', tokensUsed: 120000, tokensLimit: 500000, lastUsed: '2026-03-07T14:20:00Z' },
  { id: '6', tenantName: 'PulseWave', tokensUsed: 700000, tokensLimit: 750000, lastUsed: '2026-03-09T08:50:00Z' },
];

const settingsData = {
  rateLimitPerMinute: 60,
  defaultTokenLimit: 500000,
};

// ── component ───────────────────────────────────────────────────────
export default function AiTokensPage() {
  const [search, setSearch] = useState('');
  const [editingPricing, setEditingPricing] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);
  const [costPerToken, setCostPerToken] = useState(String(overviewData.costPerToken));
  const [sellPrice, setSellPrice] = useState(String(overviewData.sellPricePerToken));
  const [rateLimit, setRateLimit] = useState(String(settingsData.rateLimitPerMinute));
  const [defaultLimit, setDefaultLimit] = useState(String(settingsData.defaultTokenLimit));
  const debouncedSearch = useDebounce(search, 300);

  const consumedPercent = Math.round(
    (overviewData.totalConsumed / overviewData.totalAllocated) * 100,
  );

  const filteredTenants = tenantUsage.filter((t) =>
    !debouncedSearch || t.tenantName.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const handleSavePricing = () => {
    toast.success('Token pricing updated');
    setEditingPricing(false);
  };

  const handleSaveSettings = () => {
    toast.success('AI settings updated');
    setEditingSettings(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Token Management</h1>
        <p className="text-sm text-gray-500">Monitor and configure AI token usage across tenants</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Allocated', value: formatNumber(overviewData.totalAllocated), icon: Brain, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Consumed', value: formatNumber(overviewData.totalConsumed), icon: Coins, color: 'text-orange-600 bg-orange-50', sub: `${consumedPercent}% used` },
          { label: 'Remaining', value: formatNumber(overviewData.remaining), icon: Gauge, color: 'text-green-600 bg-green-50' },
          { label: 'Margin', value: `${overviewData.marginPercent}%`, icon: Percent, color: 'text-purple-600 bg-purple-50' },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-lg font-bold">{card.value}</p>
                {card.sub && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full"
                      style={{ width: `${consumedPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing + Settings row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Pricing */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Token Pricing</CardTitle>
            {editingPricing ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSavePricing}><Save className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditingPricing(false)}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditingPricing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Cost per token</span>
              {editingPricing ? (
                <Input value={costPerToken} onChange={(e) => setCostPerToken(e.target.value)} className="w-32 text-right" />
              ) : (
                <span className="font-mono font-medium">₹{overviewData.costPerToken}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Sell price per token</span>
              {editingPricing ? (
                <Input value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="w-32 text-right" />
              ) : (
                <span className="font-mono font-medium">₹{overviewData.sellPricePerToken}</span>
              )}
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-gray-700">Margin</span>
              <Badge variant="success">{overviewData.marginPercent}%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-400" /> Settings
            </CardTitle>
            {editingSettings ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSettings}><Save className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditingSettings(false)}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditingSettings(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Rate limit (per minute)</span>
              {editingSettings ? (
                <Input value={rateLimit} onChange={(e) => setRateLimit(e.target.value)} className="w-32 text-right" />
              ) : (
                <span className="font-mono font-medium">{settingsData.rateLimitPerMinute} req/min</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Default token limit</span>
              {editingSettings ? (
                <Input value={defaultLimit} onChange={(e) => setDefaultLimit(e.target.value)} className="w-32 text-right" />
              ) : (
                <span className="font-mono font-medium">{formatNumber(settingsData.defaultTokenLimit)}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={usageTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={((v: number) => formatNumber(v)) as never} />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.15}
                strokeWidth={2}
                name="Tokens"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-tenant usage table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Per-Tenant Usage</CardTitle>
          <div className="w-64">
            <Input
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredTenants.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="No tenants found"
              description="No tenants match your search"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Tenant</th>
                    <th className="pb-2 font-medium text-right">Tokens Used</th>
                    <th className="pb-2 font-medium text-right">Limit</th>
                    <th className="pb-2 font-medium text-right">Usage %</th>
                    <th className="pb-2 font-medium text-right">Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => {
                    const usagePct = Math.round((tenant.tokensUsed / tenant.tokensLimit) * 100);
                    return (
                      <tr key={tenant.id} className="border-b last:border-0">
                        <td className="py-2.5 font-medium text-gray-900">{tenant.tenantName}</td>
                        <td className="py-2.5 text-right">{formatNumber(tenant.tokensUsed)}</td>
                        <td className="py-2.5 text-right">{formatNumber(tenant.tokensLimit)}</td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(usagePct, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs">{usagePct}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right text-gray-500">
                          {new Date(tenant.lastUsed).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
