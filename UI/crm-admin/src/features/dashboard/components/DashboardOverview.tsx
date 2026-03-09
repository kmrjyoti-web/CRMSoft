"use client";

import { useState, useMemo } from "react";
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
} from "recharts";
import { Button, DatePicker } from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { HelpButton } from "@/components/common/HelpButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatINR } from "@/lib/format-currency";
import {
  useExecutiveDashboard,
  usePipeline,
  useRevenueAnalytics,
  useLeadSources,
} from "../hooks/useDashboard";
import { getDateRange } from "../utils/date-range";
import { DashboardUserHelp } from "../help/DashboardUserHelp";
import { DashboardDevHelp } from "../help/DashboardDevHelp";
import type { DateRangePreset } from "../utils/date-range";
import { CHART_COLORS } from "../utils/chart-colors";
import { KpiCard } from "./KpiCard";

export function DashboardOverview() {
  const [preset, setPreset] = useState<DateRangePreset>("30d");
  const initialRange = useMemo(() => getDateRange("30d"), []);
  const [dateFrom, setDateFrom] = useState(initialRange.dateFrom);
  const [dateTo, setDateTo] = useState(initialRange.dateTo);

  const handlePreset = (p: DateRangePreset) => {
    setPreset(p);
    const range = getDateRange(p);
    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);
  };

  const params = useMemo(() => ({ dateFrom, dateTo }), [dateFrom, dateTo]);
  const { data: kpiData, isLoading: kpiLoading } =
    useExecutiveDashboard(params);
  const { data: pipelineData } = usePipeline(params);
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

  const rawRevenue = revenueData?.data;
  const revenue: Record<string, unknown>[] = Array.isArray(rawRevenue)
    ? rawRevenue
    : [];

  const rawSources = sourcesData?.data;
  const sources: Record<string, unknown>[] = Array.isArray(rawSources)
    ? rawSources.map((s: Record<string, unknown>) => ({
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
      <PageHeader
        title="Executive Dashboard"
        actions={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <HelpButton
              panelId="dashboard-help"
              title="Dashboard — Help"
              userContent={<DashboardUserHelp />}
              devContent={<DashboardDevHelp />}
              showLabel={false}
            />
            {(
              ["7d", "30d", "90d", "thisMonth", "lastMonth"] as DateRangePreset[]
            ).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={preset === p ? "primary" : "outline"}
                onClick={() => handlePreset(p)}
              >
                {p === "7d"
                  ? "7D"
                  : p === "30d"
                    ? "30D"
                    : p === "90d"
                      ? "90D"
                      : p === "thisMonth"
                        ? "This Month"
                        : "Last Month"}
              </Button>
            ))}
            <DatePicker
              label="From"
              value={dateFrom}
              onChange={(v) => {
                setDateFrom(v);
                setPreset("custom");
              }}
            />
            <DatePicker
              label="To"
              value={dateTo}
              onChange={(v) => {
                setDateTo(v);
                setPreset("custom");
              }}
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Leads"
          value={kpis?.totalLeads ?? 0}
          icon="trending-up"
          color="#3b82f6"
        />
        <KpiCard
          title="Won Deals"
          value={kpis?.wonDeals ?? 0}
          icon="check-circle"
          color="#10b981"
        />
        <KpiCard
          title="Revenue"
          value={formatINR(Number(kpis?.totalRevenue ?? 0))}
          icon="credit-card"
          color="#f59e0b"
        />
        <KpiCard
          title="Conversion Rate"
          value={`${kpis?.conversionRate ?? 0}%`}
          icon="percent"
          color="#8b5cf6"
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

        {/* Quick Stats */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "#1e293b",
            }}
          >
            Quick Stats
          </h3>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <dt style={{ fontSize: 12, color: "#64748b" }}>Avg Deal Size</dt>
              <dd
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1e293b",
                  marginTop: 4,
                }}
              >
                {formatINR(Number(kpis?.avgDealSize ?? 0))}
              </dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: "#64748b" }}>
                Pending Activities
              </dt>
              <dd
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1e293b",
                  marginTop: 4,
                }}
              >
                {kpis?.pendingActivities ?? 0}
              </dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: "#64748b" }}>Active Leads</dt>
              <dd
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1e293b",
                  marginTop: 4,
                }}
              >
                {kpis?.activeLeads ?? 0}
              </dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: "#64748b" }}>Lost Deals</dt>
              <dd
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1e293b",
                  marginTop: 4,
                }}
              >
                {kpis?.lostDeals ?? 0}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
