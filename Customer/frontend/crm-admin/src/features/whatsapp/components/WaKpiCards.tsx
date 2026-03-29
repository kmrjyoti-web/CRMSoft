'use client';

import { KpiCard } from '@/features/dashboard/components/KpiCard';

import type { WaAnalyticsData } from '../types/analytics.types';

interface WaKpiCardsProps {
  data?: WaAnalyticsData;
}

export function WaKpiCards({ data }: WaKpiCardsProps) {
  const deliveryRate = data?.messagesSent
    ? Math.round(((data.messagesDelivered ?? 0) / data.messagesSent) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <KpiCard
        title="Conversations"
        value={data?.totalConversations ?? 0}
        icon="message-square"
        color="#3b82f6"
      />
      <KpiCard
        title="Messages Sent"
        value={data?.messagesSent ?? 0}
        icon="send"
        color="#10b981"
      />
      <KpiCard
        title="Messages Received"
        value={data?.messagesReceived ?? 0}
        icon="mail"
        color="#f59e0b"
      />
      <KpiCard
        title="Delivery Rate"
        value={`${deliveryRate}%`}
        icon="check-circle"
        color="#8b5cf6"
      />
    </div>
  );
}
