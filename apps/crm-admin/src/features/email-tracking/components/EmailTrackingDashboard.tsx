"use client";

import { useState, useMemo } from "react";
import { Badge, Icon, Input } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useTrackingSummary } from "../hooks/useEmailTracking";

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: 24,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 24,
  flexWrap: "wrap",
  gap: 12,
};

const titleGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const dateFilterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 28,
};

const statCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "18px 20px",
  background: "#fff",
};

const statValueStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1,
  margin: "8px 0 4px",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
  fontWeight: 500,
};

const chartContainerStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: "20px 24px",
  background: "#fff",
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 16,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const chartRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
};

const chartBarContainerStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const barTrackStyle: React.CSSProperties = {
  height: 8,
  borderRadius: 4,
  background: "#f3f4f6",
  overflow: "hidden",
  position: "relative",
};

const legendStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  marginBottom: 12,
};

const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: "#6b7280",
};

const legendDotStyle = (color: string): React.CSSProperties => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: color,
  flexShrink: 0,
});

const emptyChartStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 40,
  color: "#9ca3af",
  gap: 8,
};

// ── Stat Card ─────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
  suffix?: string;
}

function StatCard({ label, value, icon, iconColor, suffix }: StatCardProps) {
  return (
    <div style={statCardStyle}>
      <div style={{ color: iconColor }}>
        <Icon name={icon as "mail"} size={20} />
      </div>
      <div style={{ ...statValueStyle, color: iconColor }}>
        {value}{suffix}
      </div>
      <div style={statLabelStyle}>{label}</div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────

interface DayBarProps {
  date: string;
  opens: number;
  clicks: number;
  bounces: number;
  maxVal: number;
}

function DayBar({ date, opens, clicks, bounces, maxVal }: DayBarProps) {
  const pct = (val: number) => maxVal > 0 ? Math.max(2, Math.round((val / maxVal) * 100)) : 0;
  const label = (() => {
    try {
      return new Date(date).toLocaleDateString("en-IN", { month: "short", day: "2-digit" });
    } catch {
      return date;
    }
  })();

  return (
    <div style={chartRowStyle}>
      <div style={{ width: 50, fontSize: 11, color: "#9ca3af", textAlign: "right", flexShrink: 0 }}>
        {label}
      </div>
      <div style={chartBarContainerStyle}>
        {/* Opens bar */}
        <div style={barTrackStyle}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct(opens)}%`, background: "#3b82f6", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
        {/* Clicks bar */}
        <div style={barTrackStyle}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct(clicks)}%`, background: "#10b981", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
        {/* Bounces bar */}
        <div style={barTrackStyle}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct(bounces)}%`, background: "#ef4444", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
      </div>
      <div style={{ width: 60, fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>
        <span style={{ color: "#3b82f6" }}>{opens}</span>
        {" / "}
        <span style={{ color: "#10b981" }}>{clicks}</span>
        {" / "}
        <span style={{ color: "#ef4444" }}>{bounces}</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export function EmailTrackingDashboard() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filters = useMemo(() => ({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  }), [fromDate, toDate]);

  const { data, isLoading } = useTrackingSummary(filters);

  const summary = useMemo(() => {
    const raw = data?.data ?? data;
    return raw && typeof raw === "object" && "totalSent" in raw ? raw : null;
  }, [data]);

  const eventsByDay = useMemo(() => {
    const arr = summary?.eventsByDay ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [summary]);

  const maxVal = useMemo(() => {
    if (eventsByDay.length === 0) return 1;
    return Math.max(...eventsByDay.map((d: { opens: number; clicks: number; bounces: number }) => Math.max(d.opens, d.clicks, d.bounces)), 1);
  }, [eventsByDay]);

  const fmt = (n: number, decimals = 1) => Number(n ?? 0).toFixed(decimals);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleGroupStyle}>
          <Icon name="mail" size={22} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Email Tracking Dashboard</h2>
          <Badge variant="secondary">Analytics</Badge>
        </div>

        {/* Date Range Filter */}
        <div style={dateFilterStyle}>
          <div style={{ width: 170 }}>
            <Input
              label="From Date"
              value={fromDate}
              onChange={setFromDate}
              leftIcon={<Icon name="calendar" size={16} />}
            />
          </div>
          <div style={{ width: 170 }}>
            <Input
              label="To Date"
              value={toDate}
              onChange={setToDate}
              leftIcon={<Icon name="calendar" size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Stats Grid */}
      {!isLoading && (
        <>
          <div style={statsGridStyle}>
            <StatCard
              label="Total Sent"
              value={summary?.totalSent ?? 0}
              icon="send"
              iconColor="#6b7280"
            />
            <StatCard
              label="Open Rate"
              value={fmt(summary?.openRate ?? 0)}
              suffix="%"
              icon="mail"
              iconColor="#3b82f6"
            />
            <StatCard
              label="Click Rate"
              value={fmt(summary?.clickRate ?? 0)}
              suffix="%"
              icon="external-link"
              iconColor="#10b981"
            />
            <StatCard
              label="Bounce Rate"
              value={fmt(summary?.bounceRate ?? 0)}
              suffix="%"
              icon="alert-triangle"
              iconColor="#ef4444"
            />
          </div>

          {/* Daily Chart */}
          <div style={chartContainerStyle}>
            <div style={chartTitleStyle}>
              <Icon name="bar-chart" size={18} />
              Daily Email Events
            </div>

            {/* Legend */}
            <div style={legendStyle}>
              <div style={legendItemStyle}>
                <div style={legendDotStyle("#3b82f6")} />
                Opens
              </div>
              <div style={legendItemStyle}>
                <div style={legendDotStyle("#10b981")} />
                Clicks
              </div>
              <div style={legendItemStyle}>
                <div style={legendDotStyle("#ef4444")} />
                Bounces
              </div>
            </div>

            {/* Bars */}
            {eventsByDay.length === 0 ? (
              <div style={emptyChartStyle}>
                <Icon name="bar-chart" size={36} />
                <p style={{ margin: 0, fontSize: 14 }}>No event data for this period</p>
              </div>
            ) : (
              <div>
                {eventsByDay.map((day: { date: string; opens: number; clicks: number; bounces: number }) => (
                  <DayBar
                    key={day.date}
                    date={day.date}
                    opens={day.opens}
                    clicks={day.clicks}
                    bounces={day.bounces}
                    maxVal={maxVal}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Secondary Stats */}
          {summary && (
            <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              <div style={{ ...statCardStyle, flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Opened</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>{summary.totalOpened ?? 0}</div>
              </div>
              <div style={{ ...statCardStyle, flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Clicked</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>{summary.totalClicked ?? 0}</div>
              </div>
              <div style={{ ...statCardStyle, flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Bounced</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444" }}>{summary.totalBounced ?? 0}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
