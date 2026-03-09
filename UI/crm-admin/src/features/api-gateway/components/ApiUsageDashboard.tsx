"use client";

import { useState, useMemo } from "react";
import { Button, DatePicker, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useApiUsage, useWebhookStats } from "../hooks/useApiGateway";
import type { ApiUsageSummary, WebhookStats } from "../types/api-gateway.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function fmtMs(ms: number) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, iconColor, subtitle }: StatCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: `${iconColor}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon as any} size={22} color={iconColor} />
      </div>
      <div>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{title}</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "4px 0 0" }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ── CSS Bar Chart ─────────────────────────────────────────────────────────────

interface BarChartCssProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

function BarChartCss({ data, color = "#3b82f6", height = 140 }: BarChartCssProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingBottom: 24, position: "relative" }}>
      {data.map((d, i) => {
        const barH = Math.max(((d.value / max) * (height - 24)), 2);
        return (
          <div
            key={i}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
          >
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{d.value}</span>
            <div
              style={{
                width: "100%",
                height: barH,
                background: `linear-gradient(180deg, ${color}, ${color}aa)`,
                borderRadius: "4px 4px 0 0",
                transition: "height 0.3s ease",
              }}
              title={`${d.label}: ${d.value}`}
            />
            <span
              style={{
                fontSize: 9,
                color: "#94a3b8",
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Ranked Table ──────────────────────────────────────────────────────────────

interface RankedTableProps {
  title: string;
  rows: { label: string; count: number }[];
  color?: string;
}

function RankedTable({ title, rows, color = "#3b82f6" }: RankedTableProps) {
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #f1f5f9",
          fontSize: 14,
          fontWeight: 600,
          color: "#1e293b",
        }}
      >
        {title}
      </div>
      {rows.length === 0 ? (
        <p style={{ padding: 24, color: "#94a3b8", textAlign: "center", fontSize: 13 }}>
          No data available
        </p>
      ) : (
        <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.slice(0, 8).map((row, i) => (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    color: "#374151",
                    fontFamily: row.label.startsWith("/") ? "monospace" : "inherit",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "75%",
                  }}
                  title={row.label}
                >
                  {row.label}
                </span>
                <span style={{ color: "#64748b", fontWeight: 600, flexShrink: 0 }}>
                  {row.count.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "#f1f5f9",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct(row.count, max)}%`,
                    background: color,
                    borderRadius: 3,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type Preset = "7d" | "30d" | "90d" | "custom";

function getPresetDates(preset: Preset): { fromDate: string; toDate: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const from = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
  return { fromDate: from, toDate: to };
}

export function ApiUsageDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
  const initial = useMemo(() => getPresetDates("30d"), []);
  const [fromDate, setFromDate] = useState(initial.fromDate);
  const [toDate, setToDate] = useState(initial.toDate);

  const filters = useMemo(() => ({ fromDate, toDate }), [fromDate, toDate]);

  const { data: usageData, isLoading: usageLoading } = useApiUsage(filters);
  const { data: whData, isLoading: whLoading } = useWebhookStats(filters);

  const usage = useMemo((): ApiUsageSummary | null => {
    const raw = usageData?.data ?? usageData ?? null;
    return raw as ApiUsageSummary | null;
  }, [usageData]);

  const whStats = useMemo((): WebhookStats | null => {
    const raw = whData?.data ?? whData ?? null;
    return raw as WebhookStats | null;
  }, [whData]);

  const successRate = usage
    ? pct(usage.successCount, usage.totalRequests)
    : 0;

  const topEndpoints = useMemo(
    () => (usage?.topEndpoints ?? []).map((e) => ({ label: e.path, count: e.count })),
    [usage]
  );

  const topApiKeys = useMemo(
    () => (usage?.topApiKeys ?? []).map((k) => ({ label: k.name, count: k.count })),
    [usage]
  );

  const dailyChartData = useMemo(
    () =>
      (usage?.requestsByDay ?? []).map((d) => ({
        label: d.date.slice(5), // MM-DD
        value: d.count,
      })),
    [usage]
  );

  const handlePreset = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") {
      const range = getPresetDates(p);
      setFromDate(range.fromDate);
      setToDate(range.toDate);
    }
  };

  const isLoading = usageLoading || whLoading;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            API Usage Dashboard
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Analytics for API requests and webhooks
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {(["7d", "30d", "90d"] as Preset[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={preset === p ? "primary" : "outline"}
              onClick={() => handlePreset(p)}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </Button>
          ))}
          <DatePicker
            label="From"
            value={fromDate}
            onChange={(v) => {
              setFromDate(v);
              setPreset("custom");
            }}
          />
          <DatePicker
            label="To"
            value={toDate}
            onChange={(v) => {
              setToDate(v);
              setPreset("custom");
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : (
        <>
          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <StatCard
              title="Total Requests"
              value={(usage?.totalRequests ?? 0).toLocaleString()}
              icon="activity"
              iconColor="#3b82f6"
            />
            <StatCard
              title="Success Rate"
              value={`${successRate}%`}
              icon="check-circle"
              iconColor="#22c55e"
              subtitle={`${(usage?.successCount ?? 0).toLocaleString()} successful`}
            />
            <StatCard
              title="Avg Response Time"
              value={fmtMs(usage?.avgResponseTime ?? 0)}
              icon="clock"
              iconColor="#f59e0b"
            />
            <StatCard
              title="Error Count"
              value={(usage?.errorCount ?? 0).toLocaleString()}
              icon="alert-circle"
              iconColor="#ef4444"
              subtitle={`${pct(usage?.errorCount ?? 0, usage?.totalRequests ?? 1)}% error rate`}
            />
          </div>

          {/* Webhook Stats */}
          {whStats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <StatCard
                title="Total Deliveries"
                value={(whStats.totalDeliveries ?? 0).toLocaleString()}
                icon="send"
                iconColor="#8b5cf6"
              />
              <StatCard
                title="Webhook Success"
                value={`${pct(whStats.successCount, whStats.totalDeliveries)}%`}
                icon="check"
                iconColor="#22c55e"
              />
              <StatCard
                title="Webhook Failures"
                value={(whStats.failureCount ?? 0).toLocaleString()}
                icon="x-circle"
                iconColor="#ef4444"
              />
              <StatCard
                title="Avg Delivery Time"
                value={fmtMs(whStats.avgDuration ?? 0)}
                icon="zap"
                iconColor="#f59e0b"
              />
            </div>
          )}

          {/* Daily Requests Chart */}
          {dailyChartData.length > 0 && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "16px 20px",
                marginBottom: 24,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1e293b",
                  marginBottom: 16,
                }}
              >
                Requests by Day
              </p>
              <BarChartCss data={dailyChartData} color="#3b82f6" height={160} />
            </div>
          )}

          {/* Top Tables */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <RankedTable
              title="Top Endpoints"
              rows={topEndpoints}
              color="#3b82f6"
            />
            <RankedTable
              title="Top API Keys"
              rows={topApiKeys}
              color="#8b5cf6"
            />
          </div>
        </>
      )}
    </div>
  );
}
