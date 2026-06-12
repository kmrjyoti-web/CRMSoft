'use client';

import { Icon } from '@/components/ui';
import { formatMetricValue, getChangeColor, getChangeIcon } from '../utils/report-helpers';
import type { ReportMetric } from '../types/report.types';

interface ReportMetricCardProps {
  metric: ReportMetric;
}

export function ReportMetricCard({ metric }: ReportMetricCardProps) {
  const hasChange = metric.changePercent != null && metric.changeDirection;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {metric.label}
      </p>
      <p className="text-2xl font-bold text-gray-900">
        {formatMetricValue(metric)}
      </p>
      {hasChange && (
        <div className={`flex items-center gap-1 mt-1 text-sm ${getChangeColor(metric.changeDirection)}`}>
          <Icon name={getChangeIcon(metric.changeDirection) as any} size={14} />
          <span>{Math.abs(metric.changePercent!).toFixed(1)}%</span>
          {metric.previousValue != null && (
            <span className="text-gray-400 text-xs ml-1">
              vs {formatMetricValue({ ...metric, value: metric.previousValue })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
