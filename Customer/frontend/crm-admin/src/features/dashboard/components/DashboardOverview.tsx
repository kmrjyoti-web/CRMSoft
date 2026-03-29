"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { Icon } from "@/components/ui";
import { AICDatePicker } from "@/components/shared/AICDatePicker";
import type { DateRange } from "@/components/shared/AICDatePicker";
import { HelpButton } from "@/components/common/HelpButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatINR } from "@/lib/format-currency";
import { format, subDays } from "date-fns";
import {
  useExecutiveDashboard,
  usePipeline,
  useFunnel,
  useRevenueAnalytics,
  useLeadSources,
} from "../hooks/useDashboard";
import { DashboardUserHelp } from "../help/DashboardUserHelp";
import { DashboardDevHelp } from "../help/DashboardDevHelp";
import { CHART_COLORS } from "../utils/chart-colors";
import { KpiCard } from "./KpiCard";

export function DashboardOverview() {
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: subDays(new Date(), 30),
    end: new Date(),
  }));

  const handleRangeChange = useCallback((range: DateRange | null) => {
    if (range) setDateRange(range);
  }, []);

  const params = useMemo(
    () => ({
      dateFrom: format(dateRange.start, "yyyy-MM-dd"),
      dateTo: format(dateRange.end, "yyyy-MM-dd"),
    }),
    [dateRange],
  );

  const { data: kpiData, isLoading: kpiLoading } =
    useExecutiveDashboard(params);
  const { data: pipelineData } = usePipeline(params);
  const { data: funnelData } = useFunnel(params);
  const { data: revenueData } = useRevenueAnalytics(params);
  const { data: sourcesData } = useLeadSources(params);

  const kpis = kpiData?.data;

  // Backend may return objects with nested arrays — extract safely
  const rawPipeline = pipelineData?.data;
  const pipeline: Record<string, unknown>[] = Array.isArray(rawPipeline)
    ? rawPipeline
    : Array.isArray((rawPipeline as any)?.stages)
      ? (rawPipeline as any).stages
      : [];

  const rawFunnel = funnelData?.data;
  const funnel: { stage: string; count: number; percentage: number; fill: string }[] = Array.isArray(rawFunnel)
    ? rawFunnel.map((s: any, i: number) => ({
        stage: s.stage ?? s.name ?? `Stage ${i + 1}`,
        count: s.count ?? 0,
        percentage: s.percentage ?? 0,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : [];

  const rawRevenue = revenueData?.data;
  const revenue: Record<string, unknown>[] = Array.isArray(rawRevenue)
    ? (rawRevenue as any[])
    : [];

  const rawSources = sourcesData?.data;
  const sources: Record<string, unknown>[] = Array.isArray(rawSources)
    ? (rawSources as any[]).map((s) => ({
        ...s,
        count: s.count ?? s.totalLeads ?? 0,
        percentage: s.percentage ?? s.conversionRate ?? 0,
      }))
    : [];

  if (kpiLoading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div>
      {/* ── Toolbar Header (matches Raw Contacts style) ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5 py-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-800 m-0">
            Executive Dashboard
          </h1>
          <div className="h-5 w-px bg-gray-300" />
          <HelpButton
            panelId="dashboard-help"
            title="Dashboard — Help"
            userContent={<DashboardUserHelp />}
            devContent={<DashboardDevHelp />}
            showLabel
          />
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* 8 KPI Cards — 2 rows of 4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Leads"
          value={kpis?.totalLeads ?? 0}
          icon="trending-up"
          color="#3b82f6"
          variant="clean"
        />
        <KpiCard
          title="Active Leads"
          value={kpis?.activeLeads ?? 0}
          icon="users"
          color="#06b6d4"
          variant="clean"
        />
        <KpiCard
          title="Won Deals"
          value={kpis?.wonDeals ?? 0}
          icon="check-circle"
          color="#10b981"
          variant="clean"
        />
        <KpiCard
          title="Lost Deals"
          value={kpis?.lostDeals ?? 0}
          icon="x-circle"
          color="#ef4444"
          variant="clean"
        />
        <KpiCard
          title="Revenue"
          value={formatINR(Number(kpis?.totalRevenue ?? 0))}
          icon="indian-rupee"
          color="#f59e0b"
          variant="clean"
        />
        <KpiCard
          title="Avg Deal Size"
          value={formatINR(Number(kpis?.avgDealSize ?? 0))}
          icon="bar-chart"
          color="#8b5cf6"
          variant="clean"
        />
        <KpiCard
          title="Conversion Rate"
          value={`${kpis?.conversionRate ?? 0}%`}
          icon="percent"
          color="#ec4899"
          variant="clean"
        />
        <KpiCard
          title="Pending Activities"
          value={kpis?.pendingActivities ?? 0}
          icon="clock"
          color="#f97316"
          variant="clean"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "#1e293b",
            }}
          >
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Pipeline */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "#1e293b",
            }}
          >
            Sales Pipeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill={CHART_COLORS[1]} name="Deals" />
              <Bar dataKey="value" fill={CHART_COLORS[0]} name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Sources */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "#1e293b",
            }}
          >
            Lead Sources
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sources}
                dataKey="count"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={((props: Record<string, unknown>) =>
                  `${props.source ?? ""} (${props.percentage ?? 0}%)`) as any}
              >
                {sources.map((_entry: unknown, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "#1e293b",
            }}
          >
            Conversion Funnel
          </h3>
          {funnel.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip formatter={((value: number) => [value, "Leads"]) as any} />
                <Funnel dataKey="count" data={funnel} isAnimationActive>
                  <LabelList
                    position="right"
                    fill="#374151"
                    stroke="none"
                    dataKey="stage"
                    fontSize={12}
                  />
                  <LabelList
                    position="center"
                    fill="#fff"
                    stroke="none"
                    dataKey="count"
                    fontSize={14}
                    fontWeight={600}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 14 }}>
              No funnel data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
