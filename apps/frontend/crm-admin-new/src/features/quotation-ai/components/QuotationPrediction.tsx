"use client";

import { Badge, Card, Icon } from "@/components/ui";
import type { WinPrediction } from "../types/quotation-ai.types";

// ── Types ─────────────────────────────────────────────

interface QuotationPredictionProps {
  prediction: WinPrediction;
}

// ── Helpers ───────────────────────────────────────────

const IMPACT_COLORS: Record<string, string> = {
  POSITIVE: "#16a34a",
  NEGATIVE: "#ef4444",
  NEUTRAL: "#6b7280",
};

const IMPACT_ICONS: Record<string, string> = {
  POSITIVE: "trending-up",
  NEGATIVE: "trending-down",
  NEUTRAL: "minus",
};

const CONFIDENCE_VARIANT: Record<string, "success" | "warning" | "secondary"> = {
  HIGH: "success",
  MEDIUM: "warning",
  LOW: "secondary",
};

function probabilityColor(p: number): string {
  if (p >= 70) return "#16a34a";
  if (p >= 40) return "#f59e0b";
  return "#ef4444";
}

// ── Component ─────────────────────────────────────────

export function QuotationPrediction({ prediction }: QuotationPredictionProps) {
  const prob = prediction.probability;
  const color = probabilityColor(prob);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Percentage Display ─────────────────────────── */}
      <Card>
        <div
          style={{
            padding: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            background: `linear-gradient(135deg, ${color}08, ${color}15)`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {Math.round(prob)}%
          </div>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
            Win Probability
          </p>
          <Badge variant={CONFIDENCE_VARIANT[prediction.confidence]}>
            <Icon name="shield" size={12} /> {prediction.confidence} Confidence
          </Badge>
        </div>
      </Card>

      {/* ── Factors List ───────────────────────────────── */}
      {prediction.factors.length > 0 && (
        <Card>
          <div style={{ padding: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "0 0 14px 0" }}>
              Impact Factors
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {prediction.factors.map((factor, idx) => {
                const impactColor = IMPACT_COLORS[factor.impact];
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {/* Impact indicator bar */}
                    <div
                      style={{
                        width: 4,
                        height: 36,
                        borderRadius: 2,
                        backgroundColor: impactColor,
                        flexShrink: 0,
                      }}
                    />
                    <Icon
                      name={IMPACT_ICONS[factor.impact] as any}
                      size={16}
                      color={impactColor}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
                        {factor.factor}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {factor.description}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: impactColor,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {factor.weight > 0 ? "+" : ""}{factor.weight}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ── Recommendations ────────────────────────────── */}
      {prediction.recommendations.length > 0 && (
        <Card>
          <div style={{ padding: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="lightbulb" size={16} color="#f59e0b" />
              Recommendations
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {prediction.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fef3c7",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      backgroundColor: "#f59e0b",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.5 }}>
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
