"use client";

import { useMemo } from "react";

import { useRouter } from "next/navigation";

import { Icon, Button, Badge } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { useEmailAnalytics } from "../hooks/useEmail";

// ── Types ─────────────────────────────────────────────────

interface StatCardConfig {
  key: string;
  label: string;
  icon: string;
  color: string;
  suffix?: string;
  thresholds?: { good: number; warning: number };
}

// ── Card configs ──────────────────────────────────────────

const STAT_CARDS: StatCardConfig[] = [
  {
    key: "totalSent",
    label: "Total Sent",
    icon: "send",
    color: "#3b82f6",
  },
  {
    key: "totalReceived",
    label: "Total Received",
    icon: "inbox",
    color: "#8b5cf6",
  },
  {
    key: "openRate",
    label: "Open Rate",
    icon: "eye",
    color: "#10b981",
    suffix: "%",
    thresholds: { good: 30, warning: 15 },
  },
  {
    key: "clickRate",
    label: "Click Rate",
    icon: "mouse-pointer",
    color: "#06b6d4",
    suffix: "%",
    thresholds: { good: 5, warning: 2 },
  },
  {
    key: "bounceRate",
    label: "Bounce Rate",
    icon: "alert-triangle",
    color: "#ef4444",
    suffix: "%",
    thresholds: { good: 5, warning: 10 },
  },
  {
    key: "replyRate",
    label: "Reply Rate",
    icon: "reply",
    color: "#f59e0b",
    suffix: "%",
    thresholds: { good: 10, warning: 5 },
  },
];

// ── Helpers ───────────────────────────────────────────────

function getStatusColor(
  card: StatCardConfig,
  value: number,
): string {
  if (!card.thresholds) return card.color;

  // Bounce rate: lower is better (inverted logic)
  if (card.key === "bounceRate") {
    if (value <= card.thresholds.good) return "#10b981";
    if (value <= card.thresholds.warning) return "#f59e0b";
    return "#ef4444";
  }

  // Other rates: higher is better
  if (value >= card.thresholds.good) return "#10b981";
  if (value >= card.thresholds.warning) return "#f59e0b";
  return "#ef4444";
}

// ── Component ─────────────────────────────────────────────

export function EmailAnalyticsDashboard() {
  const router = useRouter();
  const { data: analyticsData, isLoading } = useEmailAnalytics();

  const analytics = useMemo(() => analyticsData?.data, [analyticsData]);

  if (isLoading) return <LoadingSpinner fullPage />;

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Button variant="ghost" onClick={() => router.push("/email")}>
            <Icon name="arrow-left" size={16} />
          </Button>
          <Icon name="bar-chart-2" size={24} color="#6366f1" />
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b" }}>
            Email Analytics
          </h1>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {STAT_CARDS.map((card) => {
          const rawValue = analytics
            ? (analytics as Record<string, number>)[card.key] ?? 0
            : 0;
          const displayValue = card.suffix
            ? `${rawValue.toFixed(1)}${card.suffix}`
            : rawValue.toLocaleString();
          const statusColor = getStatusColor(card, rawValue);

          return (
            <div
              key={card.key}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Icon + Label row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                  {card.label}
                </span>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `${card.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={card.icon} size={20} color={card.color} />
                </div>
              </div>

              {/* Value */}
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#1e293b",
                  lineHeight: 1,
                }}
              >
                {displayValue}
              </p>

              {/* Status indicator for rate cards */}
              {card.thresholds && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: statusColor,
                    }}
                  />
                  <span style={{ fontSize: 12, color: statusColor, fontWeight: 500 }}>
                    {statusColor === "#10b981"
                      ? "Good"
                      : statusColor === "#f59e0b"
                        ? "Needs attention"
                        : "Poor"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary section */}
      {analytics && (
        <div
          style={{
            marginTop: 24,
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>
            Summary
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 8,
                background: "#f8fafc",
              }}
            >
              <Icon name="mail" size={18} color="#3b82f6" />
              <div>
                <p style={{ fontSize: 12, color: "#6b7280" }}>Total Emails</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                  {(analytics.totalSent + analytics.totalReceived).toLocaleString()}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 8,
                background: "#f8fafc",
              }}
            >
              <Icon name="trending-up" size={18} color="#10b981" />
              <div>
                <p style={{ fontSize: 12, color: "#6b7280" }}>Engagement Rate</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                  {analytics.totalSent > 0
                    ? ((analytics.openRate + analytics.clickRate) / 2).toFixed(1)
                    : "0.0"}
                  %
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 8,
                background: "#f8fafc",
              }}
            >
              <Icon name="shield" size={18} color="#8b5cf6" />
              <div>
                <p style={{ fontSize: 12, color: "#6b7280" }}>Deliverability</p>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#1e293b" }}>
                  {(100 - analytics.bounceRate).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
