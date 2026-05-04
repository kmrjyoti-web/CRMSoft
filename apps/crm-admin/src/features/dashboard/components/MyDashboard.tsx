"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Icon, Badge } from "@/components/ui";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatINR } from "@/lib/format-currency";

import { useMyDashboard } from "../hooks/useDashboard";
import { KpiCard } from "./KpiCard";
import { CHART_COLORS } from "../utils/chart-colors";
import type { MyDashboardData } from "../types/dashboard.types";

// ── Status badge colors ──────────────────────────────────────────────

const STATUS_COLOR: Record<string, "success" | "warning" | "danger" | "primary" | "secondary"> = {
  NEW: "primary",
  CONTACTED: "secondary",
  QUALIFIED: "warning",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "danger",
};

// ── Component ────────────────────────────────────────────────────────

export function MyDashboard() {
  const router = useRouter();
  const { data, isLoading } = useMyDashboard();

  const d = useMemo<MyDashboardData>(() => {
    const raw = data?.data ?? data;
    return (raw as MyDashboardData) ?? {
      totalLeads: 0,
      activeLeads: 0,
      wonDeals: 0,
      lostDeals: 0,
      totalRevenue: 0,
      conversionRate: 0,
      avgDealSize: 0,
      pendingActivities: 0,
      todayActivities: 0,
      overdueFollowUps: 0,
      recentLeads: [],
      upcomingActivities: [],
    };
  }, [data]);

  if (isLoading) return <LoadingSpinner fullPage />;

  const pipelineMini = [
    { stage: "Active", count: d.activeLeads },
    { stage: "Won", count: d.wonDeals },
    { stage: "Lost", count: d.lostDeals },
  ];

  return (
    <div>
      <PageHeader title="My Dashboard" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="My Leads" value={d.totalLeads} icon="trending-up" color="#3b82f6" variant="clean" />
        <KpiCard title="Won Deals" value={d.wonDeals} icon="check-circle" color="#10b981" variant="clean" />
        <KpiCard title="My Revenue" value={formatINR(Number(d.totalRevenue))} icon="indian-rupee" color="#f59e0b" variant="clean" />
        <KpiCard title="Conversion" value={`${d.conversionRate}%`} icon="percent" color="#8b5cf6" variant="clean" />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ActionCard
          icon="clock"
          iconColor="#f59e0b"
          label="Pending Activities"
          count={d.pendingActivities}
          onClick={() => router.push("/activities")}
        />
        <ActionCard
          icon="calendar"
          iconColor="#3b82f6"
          label="Today's Activities"
          count={d.todayActivities}
          onClick={() => router.push("/activities")}
        />
        <ActionCard
          icon="alert-circle"
          iconColor="#ef4444"
          label="Overdue Follow-ups"
          count={d.overdueFollowUps}
          onClick={() => router.push("/follow-ups")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Pipeline */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
            My Pipeline
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipelineMini}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Leads */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
            Recent Leads
          </h3>
          {(d.recentLeads ?? []).length === 0 ? (
            <EmptyState message="No recent leads" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {d.recentLeads.slice(0, 6).map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #f3f4f6",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{lead.title}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                      {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                      {formatINR(lead.value)}
                    </span>
                    <Badge variant={STATUS_COLOR[lead.status] ?? "secondary"} style={{ fontSize: 11 }}>
                      {lead.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Activities */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>
            Upcoming Activities
          </h3>
          {(d.upcomingActivities ?? []).length === 0 ? (
            <EmptyState message="No upcoming activities" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {d.upcomingActivities.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  onClick={() => router.push("/activities")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #f3f4f6",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="calendar" size={18} color="#3b82f6" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                      {act.type} &middot; {new Date(act.dueDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function ActionCard({
  icon,
  iconColor,
  label,
  count,
  onClick,
}: {
  icon: string;
  iconColor: string;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: "16px 20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${iconColor}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon as any} size={22} color={iconColor} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{count}</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", padding: 32, color: "#9ca3af", fontSize: 14 }}>
      {message}
    </div>
  );
}
