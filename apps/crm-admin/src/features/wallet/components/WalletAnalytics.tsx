'use client';

import { Icon, Card, Badge } from '@/components/ui';
import { useRevenueSummary, useSpendByCategory, useTopServices } from '../hooks/useWalletAdmin';
import { formatTokens, tokensToAmount } from '../utils/wallet-helpers';

export function WalletAnalytics() {
  const { data: summaryResponse, isLoading } = useRevenueSummary(30);
  const { data: byCategoryResponse } = useSpendByCategory(undefined, 30);
  const { data: topServicesResponse } = useTopServices(undefined, 30);
  const summary = summaryResponse?.data;
  const byCategory = Array.isArray(byCategoryResponse?.data) ? byCategoryResponse.data : [];
  const topServices = Array.isArray(topServicesResponse?.data) ? topServicesResponse.data : [];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide wallet metrics (last 30 days)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Total Recharged</div>
          <div className="text-2xl font-bold text-green-600">
            {formatTokens(summary?.totalRecharged ?? 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {tokensToAmount(summary?.totalRecharged ?? 0)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-red-600">
            {formatTokens(summary?.totalSpent ?? 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {tokensToAmount(summary?.totalSpent ?? 0)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Active Wallets</div>
          <div className="text-2xl font-bold text-blue-600">
            {summary?.activeWallets ?? 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            of {summary?.totalWallets ?? 0} total
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500 mb-1">Period</div>
          <div className="text-2xl font-bold text-gray-900">
            {summary?.periodDays ?? 30}
          </div>
          <div className="text-xs text-gray-400 mt-1">days</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spend by Category */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Spend by Category
          </h3>
          <div className="space-y-3">
            {byCategory.map((item) => {
              const maxTokens = Math.max(...byCategory.map((c) => c.tokens), 1);
              const percent = Math.round((item.tokens / maxTokens) * 100);
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 capitalize">{item.category}</span>
                    <span className="text-sm font-medium">{formatTokens(item.tokens)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {byCategory.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No spending data</p>
            )}
          </div>
        </Card>

        {/* Top Services */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Top Services
          </h3>
          <div className="space-y-2">
            {topServices.map((svc, i) => (
              <div key={svc.serviceKey} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                  <div>
                    <span className="text-sm text-gray-700">{svc.serviceKey}</span>
                    <span className="text-xs text-gray-400 ml-2">({svc.count} calls)</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatTokens(svc.tokens)}</span>
              </div>
            ))}
            {topServices.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No service usage data</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
