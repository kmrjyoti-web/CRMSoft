"use client";

import { Badge, Icon } from "@/components/ui";
import type { ConversionFunnel as ConversionFunnelType } from "../types/quotation-analytics.types";
import { formatCurrency } from "@/lib/format-currency";

// ── Types ─────────────────────────────────────────────

interface ConversionFunnelProps {
  data: ConversionFunnelType;
}

// ── Helpers ───────────────────────────────────────────


/** Blue-to-green gradient based on stage index */
function stageColor(index: number, total: number): string {
  if (total <= 1) return "#3b82f6";
  const ratio = index / (total - 1);
  // Interpolate from #3b82f6 (blue) to #16a34a (green)
  const r = Math.round(59 + (22 - 59) * ratio);
  const g = Math.round(130 + (163 - 130) * ratio);
  const b = Math.round(246 + (74 - 246) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── Component ─────────────────────────────────────────

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const stages = data.stages ?? [];

  if (stages.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>No funnel data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {stages.map((stage, idx) => {
        const widthPercent = Math.max((stage.count / maxCount) * 100, 8);
        const color = stageColor(idx, stages.length);

        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Stage header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                  {stage.stage}
                </span>
                <Badge variant="outline">
                  {stage.count}
                </Badge>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {formatCurrency(stage.value)}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color,
                    minWidth: 42,
                    textAlign: "right",
                  }}
                >
                  {stage.conversionRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Horizontal bar */}
            <div
              style={{
                position: "relative",
                height: 28,
                backgroundColor: "#f1f5f9",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${widthPercent}%`,
                  backgroundColor: color,
                  borderRadius: 6,
                  transition: "width 0.5s ease",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 10,
                  minWidth: 60,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  {stage.count} | {stage.conversionRate.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Avg days */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="clock" size={11} color="#94a3b8" />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                Avg {stage.avgDays.toFixed(0)} day{stage.avgDays !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Connector arrow between stages */}
            {idx < stages.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
                <Icon name="chevron-down" size={14} color="#cbd5e1" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
