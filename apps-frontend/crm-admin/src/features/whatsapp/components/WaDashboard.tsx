'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AICDatePicker } from '@/components/shared/AICDatePicker';
import type { DateRange } from '@/components/shared/AICDatePicker';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CHART_COLORS } from '@/features/dashboard/utils/chart-colors';
import { format, subDays } from 'date-fns';
import { useWaAnalytics, useWaAgentPerformance } from '../hooks/useWaAnalytics';
import { WaKpiCards } from './WaKpiCards';
import { AgentPerformanceTable } from './AgentPerformanceTable';

export function WaDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: subDays(new Date(), 30),
    end: new Date(),
  }));

  const handleRangeChange = useCallback((range: DateRange | null) => {
    if (range) setDateRange(range);
  }, []);

  const params = useMemo(
    () => ({
      dateFrom: format(dateRange.start, 'yyyy-MM-dd'),
      dateTo: format(dateRange.end, 'yyyy-MM-dd'),
    }),
    [dateRange],
  );
  const { data: statsData, isLoading } = useWaAnalytics(params);
  const { data: agentsData, isLoading: agentsLoading } = useWaAgentPerformance(params);

  const stats = statsData?.data;
  const agents = Array.isArray(agentsData?.data) ? agentsData.data : [];

  // Build chart data from stats
  const messageChart = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Sent', value: stats.messagesSent ?? 0 },
      { name: 'Delivered', value: stats.messagesDelivered ?? 0 },
      { name: 'Read', value: stats.messagesRead ?? 0 },
      { name: 'Failed', value: stats.messagesFailed ?? 0 },
    ];
  }, [stats]);

  const conversationChart = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Open', value: stats.openConversations ?? 0 },
      { name: 'Pending', value: stats.pendingConversations ?? 0 },
      { name: 'Resolved', value: stats.resolvedConversations ?? 0 },
    ];
  }, [stats]);

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      {/* ── Toolbar Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5 py-2 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800 m-0">WhatsApp Dashboard</h1>
        <AICDatePicker
          mode="range"
          dateRange={dateRange}
          onRangeChange={handleRangeChange}
          showPresets
          showHighlights
          placeholder="Select date range"
          size="sm"
          dropdownAlign="right"
        />
      </div>

      <WaKpiCards data={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Message Delivery */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            Message Delivery
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={messageChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Messages">
                {messageChart.map((_entry, index) => (
                  <Cell key={`msg-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversation Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            Conversation Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conversationChart}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={((props: Record<string, unknown>) =>
                  `${props.name} (${props.value})`) as any}
              >
                {conversationChart.map((_entry, index) => (
                  <Cell key={`conv-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <AgentPerformanceTable data={agents} isLoading={agentsLoading} />
    </div>
  );
}
