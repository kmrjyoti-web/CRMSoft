'use client';

import { useState } from 'react';
import { Icon, Badge, Button, Card } from '@/components/ui';
import { useCurrentSubscription, useLimitsWithUsage, useTenantInvoices } from '../hooks/useSubscription';
import {
  RESOURCE_LABELS, RESOURCE_ICONS, FEATURE_LABELS,
  formatLimit, getUsagePercent, getUsageBarColor, getUsageColor, formatCurrency,
} from '../utils/subscription-helpers';
import { PlanComparisonTable } from './PlanComparisonTable';
import type { LimitWithUsage } from '../types/subscription.types';

function UsageBar({ item }: { item: LimitWithUsage }) {
  const label = RESOURCE_LABELS[item.resourceKey] ?? item.resourceKey;
  const icon = RESOURCE_ICONS[item.resourceKey] ?? 'hash';
  const percent = getUsagePercent(item.current, item.limit, item.limitType);
  const barColor = getUsageBarColor(percent);
  const textColor = getUsageColor(percent);

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-6 flex justify-center">
        <Icon name={icon as any} size={16} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700">{label}</span>
          <span className={`text-sm font-medium ${textColor}`}>
            {item.limitType === 'DISABLED' ? (
              <Badge variant="danger">Disabled</Badge>
            ) : (
              `${item.current} / ${formatLimit(item.limitType, item.limit)}`
            )}
            {item.limitType === 'MONTHLY' && (
              <span className="text-xs text-gray-400 ml-1">(monthly)</span>
            )}
          </span>
        </div>
        {item.limitType !== 'UNLIMITED' && item.limitType !== 'DISABLED' && (
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
        {item.isChargeable && (
          <div className="text-xs text-amber-500 mt-0.5">
            Chargeable: {item.chargeTokens} tokens/unit
          </div>
        )}
      </div>
    </div>
  );
}

export function SubscriptionOverview() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { data: subRes, isLoading: subLoading } = useCurrentSubscription();
  const { data: limitsRes, isLoading: limitsLoading } = useLimitsWithUsage();
  const { data: invoicesRes } = useTenantInvoices();

  // API responses are wrapped: { success, data: actualPayload }
  const subscription = (subRes as any)?.data ?? subRes;
  const limitsData = (limitsRes as any)?.data ?? limitsRes;
  const rawInvoices = (invoicesRes as any)?.data ?? invoicesRes;
  const invoices: any[] = Array.isArray(rawInvoices) ? rawInvoices : [];

  if (subLoading || limitsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded" />
          <div className="h-60 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const plan = subscription?.plan;
  const limits = limitsData?.limits ?? [];
  const features = plan?.features ?? [];

  const statusBadge: Record<string, 'success' | 'warning' | 'danger' | 'primary'> = {
    ACTIVE: 'success',
    TRIALING: 'primary',
    PAST_DUE: 'warning',
    CANCELLED: 'danger',
    EXPIRED: 'danger',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your plan and usage</p>
        </div>
        <Button variant="primary" onClick={() => setShowUpgrade(true)}>
          <Icon name="arrow-up-circle" size={16} className="mr-2" />
          Change Plan
        </Button>
      </div>

      {/* Current Plan Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Icon name="crown" size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {plan?.name ?? 'No Plan'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={statusBadge[subscription?.status ?? 'ACTIVE'] ?? 'default'}>
                  {subscription?.status ?? 'N/A'}
                </Badge>
                {subscription?.currentPeriodEnd && (
                  <span className="text-xs text-gray-400">
                    Period: {new Date(subscription.currentPeriodStart!).toLocaleDateString()} –{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {plan ? formatCurrency(Number(plan.price)) : '—'}
            </div>
            <div className="text-xs text-gray-400">
              per {plan?.interval?.toLowerCase() ?? 'month'}
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Limits */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Resource Usage
        </h3>
        <div className="divide-y divide-gray-100">
          {limits.map((item) => (
            <UsageBar key={item.resourceKey} item={item} />
          ))}
          {limits.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">
              No resource limits configured for this plan
            </p>
          )}
        </div>
      </Card>

      {/* Feature Flags */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Features
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FEATURE_LABELS).map(([key, label]) => {
            const enabled = features.includes(key);
            return (
              <div
                key={key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  enabled
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                }`}
              >
                <Icon
                  name={enabled ? 'check' : 'x'}
                  size={12}
                  className={enabled ? 'text-green-500' : 'text-gray-300'}
                />
                {label}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Billing History
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {(invoices ?? []).slice(0, 5).map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Icon name="receipt" size={16} className="text-gray-400" />
                <div>
                  <span className="text-sm text-gray-700">{inv.invoiceNumber}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(inv.periodStart).toLocaleDateString()} –{' '}
                    {new Date(inv.periodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{formatCurrency(inv.total)}</span>
                <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>
                  {inv.status}
                </Badge>
              </div>
            </div>
          ))}
          {(!invoices || invoices.length === 0) && (
            <p className="text-sm text-gray-400 py-4 text-center">No billing history</p>
          )}
        </div>
      </Card>

      {/* Plan Comparison Modal */}
      {showUpgrade && (
        <PlanComparisonTable onClose={() => setShowUpgrade(false)} currentPlanId={plan?.id} />
      )}
    </div>
  );
}
