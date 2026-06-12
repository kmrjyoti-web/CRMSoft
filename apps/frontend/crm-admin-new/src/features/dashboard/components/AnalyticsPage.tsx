"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Icon } from "@/components/ui";
import { AICDatePicker } from "@/components/shared/AICDatePicker";
import type { DateRange } from "@/components/shared/AICDatePicker";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatINR } from "@/lib/format-currency";
import { format, subDays } from "date-fns";

import {
  useLostReasons,
  useActivityHeatmap,
  useAging,
  useVelocity,
  useRevenueAnalytics,
} from "../hooks/useDashboard";
import { CHART_COLORS } from "../utils/chart-colors";
import type { HeatmapCell, AgingBucket, LostReasonItem, VelocityMetrics } from "../types/dashboard.types";

// ── Day / Hour labels ────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12a" : i < 12 ? `${i}a` : i === 12 ? "12p" : `${i - 12}p`,
);

// ── Heatmap color scale ──────────────────────────────────────────────

function heatColor(count: number, max: number): string {
  if (max === 0 || count === 0) return "#f3f4f6";
  const ratio = count / max;
  if (ratio < 0.25) return "#dbeafe";
  if (ratio < 0.5) return "#93c5fd";
  if (ratio < 0.75) return "#3b82f6";
  return "#1d4ed8";
}

// ── Component ────────────────────────────────────────────────────────

export function AnalyticsPage() {
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

  const { data: lostData, isLoading: lostLoading } = useLostReasons(params);
  const { data: heatmapData, isLoading: heatLoading } = useActivityHeatmap(params);
  const { data: agingData, isLoading: agingLoading } = useAging(params);
  const { data: velocityData, isLoading: velLoading } = useVelocity(params);
  const { data: revenueData } = useRevenueAnalytics(params);

  const lostReasons: LostReasonItem[] = useMemo(() => {
    const raw = lostData?.data ?? lostData;
    return Array.isArray(raw) ? raw : [];
  }, [lostData]);

  const heatCells: HeatmapCell[] = useMemo(() => {
    const raw = heatmapData?.data ?? heatmapData;
    return Array.isArray(raw) ? raw : [];
  }, [heatmapData]);

  const agingBuckets: AgingBucket[] = useMemo(() => {
    const raw = agingData?.data ?? agingData;
    return Array.isArray(raw) ? raw : [];
  }, [agingData]);

  const velocity: VelocityMetrics | null = useMemo(() => {
    const raw = velocityData?.data ?? velocityData;
    return raw && typeof raw === "object" && "avgDaysToClose" in (raw as any) ? raw as VelocityMetrics : null;
  }, [velocityData]);

  const revenuePoints = useMemo(() => {
    const raw = revenueData?.data;
    return Array.isArray(raw) ? raw : [];
  }, [revenueData]);

  const heatMax = useMemo(() => Math.max(1, ...heatCells.map((c) => c.count)), [heatCells]);

  const isLoading = lostLoading || heatLoading || agingLoading || velLoading;

  return (
    <div>
      {/* ── Toolbar Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5 py-2 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-800 m-0">Analytics</h1>
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

      {isLoading && <LoadingSpinner fullPage />}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Heatmap (7×24 grid) */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
              Activity Heatmap
            </h3>
            {heatCells.length === 0 ? (
              <EmptyChart message="No activity data" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: 48 }} />
                      {HOUR_LABELS.map((h) => (
                        <th key={h} style={{ fontSize: 10, color: "#9ca3af", fontWeight: 400, padding: "0 1px", textAlign: "center" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAY_LABELS.map((day, di) => (
                      <tr key={day}>
                        <td style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, paddingRight: 8, textAlign: "right" }}>
                          {day}
                        </td>
                        {Array.from({ length: 24 }, (_, hi) => {
                          const cell = heatCells.find((c) => c.day === di && c.hour === hi);
                          const count = cell?.count ?? 0;
                          return (
                            <td key={hi} style={{ padding: 1 }}>
                              <div
                                title={`${day} ${HOUR_LABELS[hi]}: ${count} activities`}
                                style={{
                                  width: "100%",
                                  aspectRatio: "1",
                                  minWidth: 16,
                                  minHeight: 16,
                                  borderRadius: 3,
                                  background: heatColor(count, heatMax),
                                  cursor: "default",
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Legend */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>Less</span>
                  {["#f3f4f6", "#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8"].map((c) => (
                    <div key={c} style={{ width: 14, height: 14, borderRadius: 2, background: c }} />
                  ))}
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>More</span>
                </div>
              </div>
            )}
          </div>

          {/* Revenue Trend */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
              Revenue Trend
            </h3>
            {revenuePoints.length === 0 ? (
              <EmptyChart message="No revenue data" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenuePoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="deals" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Lost Reasons */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
              Lost Reasons
            </h3>
            {lostReasons.length === 0 ? (
              <EmptyChart message="No lost reasons data" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={lostReasons} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="reason" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip formatter={((v: number) => [v, "Leads"]) as any} />
                  <Bar dataKey="count" fill={CHART_COLORS[3]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Aging Distribution */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
              Lead Aging Distribution
            </h3>
            {agingBuckets.length === 0 ? (
              <EmptyChart message="No aging data" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={agingBuckets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={CHART_COLORS[4]} name="Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgValue" fill={CHART_COLORS[5]} name="Avg Value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Velocity Metrics */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
              Deal Velocity
            </h3>
            {!velocity ? (
              <EmptyChart message="No velocity data" />
            ) : (
              <div>
                {/* Hero metric */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 40, fontWeight: 700, color: "#1e293b" }}>
                    {velocity.avgDaysToClose}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Average days to close</div>
                </div>

                {/* Avg days per stage */}
                {velocity.avgDaysInStage && Object.keys(velocity.avgDaysInStage).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                      Time per Stage
                    </div>
                    {Object.entries(velocity.avgDaysInStage).map(([stage, days], i) => (
                      <div key={stage} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#6b7280", width: 100, textAlign: "right" }}>{stage}</span>
                        <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min((days / velocity.avgDaysToClose) * 100, 100)}%`,
                              background: CHART_COLORS[i % CHART_COLORS.length],
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", width: 40 }}>{days}d</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Velocity trend */}
                {(velocity.trend ?? []).length > 0 && (
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={velocity.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgDays" stroke={CHART_COLORS[4]} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty chart placeholder ──────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
      <Icon name="bar-chart" size={36} color="#d1d5db" />
      <p style={{ marginTop: 8, fontSize: 14 }}>{message}</p>
    </div>
  );
}
