"use client";

import { Card, Badge, Icon } from "@/components/ui";
import type { QuotationTrend } from "../types/quotation-analytics.types";

// ── Types ─────────────────────────────────────────────

interface QuotationTrendsProps {
  trends: QuotationTrend[];
}

// ── Helpers ───────────────────────────────────────────

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

const BAR_COLORS: Record<string, string> = {
  created: "#3b82f6",
  sent: "#8b5cf6",
  accepted: "#16a34a",
  rejected: "#ef4444",
};

const BAR_LABELS: Record<string, string> = {
  created: "Created",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
};

// ── Component ─────────────────────────────────────────

export function QuotationTrends({ trends }: QuotationTrendsProps) {
  if (!trends || trends.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <div style={{ padding: 32, textAlign: "center" }}>
            <Icon name="bar-chart-2" size={32} color="#cbd5e1" />
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>No trend data available</p>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate max for bar scaling
  const maxValue = Math.max(
    ...trends.flatMap((t) => [t.created, t.sent, t.accepted, t.rejected]),
    1,
  );

  // Summary totals
  const totals = trends.reduce(
    (acc, t) => ({
      totalValue: acc.totalValue + t.totalValue,
      acceptedValue: acc.acceptedValue + t.acceptedValue,
      created: acc.created + t.created,
      sent: acc.sent + t.sent,
      accepted: acc.accepted + t.accepted,
      rejected: acc.rejected + t.rejected,
    }),
    { totalValue: 0, acceptedValue: 0, created: 0, sent: 0, accepted: 0, rejected: 0 },
  );

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Summary ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card>
          <div style={{ padding: 16, minWidth: 160 }}>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px 0" }}>Total Value</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              {formatCurrency(totals.totalValue)}
            </p>
          </div>
        </Card>
        <Card>
          <div style={{ padding: 16, minWidth: 160 }}>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px 0" }}>Accepted Value</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#16a34a", margin: 0 }}>
              {formatCurrency(totals.acceptedValue)}
            </p>
          </div>
        </Card>
        <Card>
          <div style={{ padding: 16, minWidth: 120 }}>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px 0" }}>Acceptance Rate</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "#8b5cf6", margin: 0 }}>
              {totals.created > 0 ? ((totals.accepted / totals.created) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* ── Legend ──────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {(["created", "sent", "accepted", "rejected"] as const).map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: BAR_COLORS[key],
              }}
            />
            <span style={{ fontSize: 12, color: "#64748b" }}>{BAR_LABELS[key]}</span>
          </div>
        ))}
      </div>

      {/* ── Trend Bars ─────────────────────────────────── */}
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {trends.map((trend, tIdx) => (
              <div key={tIdx}>
                {/* Period label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {trend.period}
                  </span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {formatCurrency(trend.totalValue)}
                    </span>
                    {trend.acceptedValue > 0 && (
                      <Badge variant="success">
                        {formatCurrency(trend.acceptedValue)} won
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stacked bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {(["created", "sent", "accepted", "rejected"] as const).map((key) => {
                    const val = trend[key];
                    if (val === 0) return null;
                    const widthPercent = Math.max((val / maxValue) * 100, 4);

                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            width: 60,
                            textAlign: "right",
                            flexShrink: 0,
                          }}
                        >
                          {BAR_LABELS[key]}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: 20,
                            backgroundColor: "#f1f5f9",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${widthPercent}%`,
                              backgroundColor: BAR_COLORS[key],
                              borderRadius: 4,
                              transition: "width 0.4s ease",
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: 6,
                              minWidth: 28,
                            }}
                          >
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>
                              {val}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Separator */}
                {tIdx < trends.length - 1 && (
                  <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginTop: 12 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
