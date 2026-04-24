'use client';

import { Badge, Icon } from '@/components/ui';
import { useTenantActivity } from '../hooks/useVendor';
import { timeAgo } from '../utils/vendor-helpers';
import type { TenantActivityLogItem } from '../types/vendor.types';

interface TenantActivityTimelineProps {
  tenantId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  AUTH: 'primary',
  CONFIG: 'secondary',
  LICENSE: 'success',
  BILLING: 'warning',
  MODULE: 'primary',
  USER: 'secondary',
  DATA: 'danger',
};

const CATEGORY_ICONS: Record<string, string> = {
  AUTH: 'log-in',
  CONFIG: 'settings',
  LICENSE: 'key',
  BILLING: 'credit-card',
  MODULE: 'package',
  USER: 'user',
  DATA: 'database',
};

export function TenantActivityTimeline({ tenantId }: TenantActivityTimelineProps) {
  const { data: activityResp, isLoading } = useTenantActivity(tenantId, { limit: 50 });

  const activities: TenantActivityLogItem[] = Array.isArray(activityResp?.data)
    ? activityResp.data
    : [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <Icon name="clock" size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

      <div className="space-y-4">
        {activities.map((activity) => {
          const categoryColor = CATEGORY_COLORS[activity.category] ?? 'secondary';
          const iconName = CATEGORY_ICONS[activity.category] ?? 'activity';

          return (
            <div key={activity.id} className="relative flex gap-4 pl-0">
              {/* Timeline dot */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shrink-0">
                <Icon name={iconName as any} size={14} className="text-gray-500" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    {activity.details && (
                      <p className="text-sm text-gray-500 mt-0.5">{activity.details}</p>
                    )}
                  </div>
                  <Badge variant={categoryColor as any} className="shrink-0 text-xs">
                    {activity.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
