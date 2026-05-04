'use client';

import { Icon, Card } from '@/components/ui';
import { useUsageDetail } from '../hooks/useSubscription';
import { RESOURCE_LABELS, RESOURCE_ICONS } from '../utils/subscription-helpers';

export function UsageBreakdown() {
  const { data: usageDetails, isLoading } = useUsageDetail();

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-lg" />;
  }

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
        Detailed Usage
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Resource</th>
              <th className="text-right py-2 text-gray-500 font-medium">Total Count</th>
              <th className="text-right py-2 text-gray-500 font-medium">This Month</th>
              <th className="text-right py-2 text-gray-500 font-medium">Month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(usageDetails ?? []).map((d) => (
              <tr key={d.resourceKey} className="hover:bg-gray-50">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={(RESOURCE_ICONS[d.resourceKey] ?? 'hash') as any}
                      size={14}
                      className="text-gray-400"
                    />
                    <span className="text-gray-700">
                      {RESOURCE_LABELS[d.resourceKey] ?? d.resourceKey}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-medium text-gray-900">{d.currentCount}</td>
                <td className="py-2.5 text-right text-gray-600">{d.monthlyCount}</td>
                <td className="py-2.5 text-right text-gray-400 text-xs">{d.monthYear ?? '—'}</td>
              </tr>
            ))}
            {(!usageDetails || usageDetails.length === 0) && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No usage data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
