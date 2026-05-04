"use client";
import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";

interface FunnelStep {
  label: string;
  value: number;
  color: string;
  icon: IconName;
}

interface AnalyticsFunnelProps {
  impressions: number;
  clicks: number;
  enquiries: number;
  leads: number;
  orders: number;
}

export function AnalyticsFunnel({ impressions, clicks, enquiries, leads, orders }: AnalyticsFunnelProps) {
  const steps: FunnelStep[] = [
    { label: 'Impressions', value: impressions, color: '#6366f1', icon: 'eye' },
    { label: 'Clicks', value: clicks, color: '#3b82f6', icon: 'mouse-pointer' },
    { label: 'Enquiries', value: enquiries, color: '#f59e0b', icon: 'message-circle' },
    { label: 'Leads', value: leads, color: '#10b981', icon: 'user-plus' },
    { label: 'Orders', value: orders, color: '#ec4899', icon: 'shopping-bag' },
  ];

  const maxVal = impressions || 1;

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].value : step.value;
        const convRate = prev > 0 ? ((step.value / prev) * 100).toFixed(1) : '0.0';
        const barWidth = (step.value / maxVal) * 100;

        return (
          <div key={step.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <Icon name={step.icon} size={12} color={step.color} />
                </div>
                <span className="text-sm text-gray-600">{step.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {i > 0 && (
                  <span className="text-xs text-gray-400">{convRate}%</span>
                )}
                <span className="text-sm font-semibold text-gray-900">{step.value.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${barWidth}%`, backgroundColor: step.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
