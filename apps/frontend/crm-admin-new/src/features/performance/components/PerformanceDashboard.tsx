"use client";

import { useState, useMemo } from "react";

import { SelectInput, Icon } from "@/components/ui";

import { useTeamPerformance } from "../hooks/usePerformance";

import { Leaderboard } from "./Leaderboard";

// ── Component ───────────────────────────────────────────

export function PerformanceDashboard() {
  const [period, setPeriod] = useState("MONTHLY");

  const { data, isLoading } = useTeamPerformance({ period });

  const perf = useMemo(() => {
    return (
      data?.data ?? {
        totalLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        totalRevenue: 0,
        totalActivities: 0,
        byMember: [],
        byPeriod: [],
      }
    );
  }, [data]);

  const periodOptions = [
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
    { label: "Quarterly", value: "QUARTERLY" },
  ];

  const kpis = [
    {
      label: "Total Leads",
      value: perf.totalLeads.toLocaleString(),
      icon: "users" as const,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Converted",
      value: perf.convertedLeads.toLocaleString(),
      icon: "check-circle" as const,
      color: "#22c55e",
      bg: "#f0fdf4",
    },
    {
      label: "Conversion Rate",
      value: `${perf.conversionRate.toFixed(1)}%`,
      icon: "percent" as const,
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      label: "Total Revenue",
      value: perf.totalRevenue.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
      icon: "indian-rupee" as const,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      label: "Activities",
      value: perf.totalActivities.toLocaleString(),
      icon: "activity" as const,
      color: "#ec4899",
      bg: "#fdf2f8",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Performance</h1>
        <div style={{ width: 180 }}>
          <SelectInput
            label="Period"
            options={periodOptions}
            value={period}
            onChange={(val: string | number | boolean | null) =>
              setPeriod(String(val ?? "MONTHLY"))
            }
            leftIcon={<Icon name="calendar" size={16} />}
          />
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
          Loading performance data...
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 20,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                    {kpi.label}
                  </span>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: kpi.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={kpi.icon} size={18} style={{ color: kpi.color }} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard section */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <Leaderboard />
          </div>
        </>
      )}
    </div>
  );
}
