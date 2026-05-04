"use client";

import { useState, useEffect } from "react";
import { Button, Card, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { usePredictWin } from "../hooks/useQuotationAI";
import type { WinPrediction } from "../types/quotation-ai.types";

// ── Types ─────────────────────────────────────────────

interface AIAssistPanelProps {
  quotationId?: string;
  leadId: string;
  totalAmount: number;
  items: { productId: string; quantity: number; unitPrice: number }[];
}

// ── Helpers ───────────────────────────────────────────

const IMPACT_COLORS: Record<string, string> = {
  POSITIVE: "#16a34a",
  NEGATIVE: "#ef4444",
  NEUTRAL: "#6b7280",
};

const IMPACT_BADGE_VARIANT: Record<string, "success" | "danger" | "secondary"> = {
  POSITIVE: "success",
  NEGATIVE: "danger",
  NEUTRAL: "secondary",
};

function probabilityColor(p: number): string {
  if (p >= 70) return "#16a34a";
  if (p >= 40) return "#f59e0b";
  return "#ef4444";
}

// ── Component ─────────────────────────────────────────

export function AIAssistPanel({ quotationId, leadId, totalAmount, items }: AIAssistPanelProps) {
  const predictWin = usePredictWin();
  const [prediction, setPrediction] = useState<WinPrediction | null>(null);

  // Predict when panel opens
  useEffect(() => {
    if (!leadId || items.length === 0) return;
    predictWin.mutate(
      { quotationId, leadId, totalAmount, items },
      {
        onSuccess: (data) => {
          setPrediction(data as WinPrediction);
        },
      },
    );
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    predictWin.mutate(
      { quotationId, leadId, totalAmount, items },
      {
        onSuccess: (data) => {
          setPrediction(data as WinPrediction);
        },
      },
    );
  };

  // ── Loading state ───────────────────────────────────
  if (predictWin.isPending && !prediction) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <LoadingSpinner />
            <p style={{ fontSize: 14, color: "#64748b" }}>Analyzing quotation...</p>
          </div>
        </Card>
      </div>
    );
  }

  const prob = prediction?.probability ?? 0;
  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (prob / 100) * circumference;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="brain" size={20} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0 }}>AI Assist</h3>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={predictWin.isPending}>
          <Icon name="refresh-cw" size={14} />
          {predictWin.isPending ? "Analyzing..." : "Refresh"}
        </Button>
      </div>

      {/* ── Circular Progress ──────────────────────────── */}
      {prediction && (
        <Card>
          <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <svg width={128} height={128} viewBox="0 0 128 128">
              {/* Background circle */}
              <circle
                cx={64}
                cy={64}
                r={54}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={8}
              />
              {/* Progress arc */}
              <circle
                cx={64}
                cy={64}
                r={54}
                fill="none"
                stroke={probabilityColor(prob)}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform="rotate(-90 64 64)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
              {/* Percentage text */}
              <text
                x={64}
                y={60}
                textAnchor="middle"
                style={{ fontSize: 28, fontWeight: 700, fill: "#1e293b" }}
              >
                {Math.round(prob)}%
              </text>
              <text
                x={64}
                y={78}
                textAnchor="middle"
                style={{ fontSize: 11, fill: "#64748b" }}
              >
                Win Probability
              </text>
            </svg>

            <Badge variant={prediction.confidence === "HIGH" ? "success" : prediction.confidence === "MEDIUM" ? "warning" : "secondary"}>
              {prediction.confidence} Confidence
            </Badge>
          </div>
        </Card>
      )}

      {/* ── Confidence Factors ─────────────────────────── */}
      {prediction && prediction.factors.length > 0 && (
        <Card>
          <div style={{ padding: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: "0 0 12px 0" }}>
              Key Factors
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {prediction.factors.map((f, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 6,
                    backgroundColor: `${IMPACT_COLORS[f.impact]}08`,
                    border: `1px solid ${IMPACT_COLORS[f.impact]}20`,
                  }}
                >
                  <Icon
                    name={f.impact === "POSITIVE" ? "arrow-up-circle" : f.impact === "NEGATIVE" ? "arrow-down-circle" : "minus-circle"}
                    size={16}
                    color={IMPACT_COLORS[f.impact]}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{f.factor}</span>
                      <Badge variant={IMPACT_BADGE_VARIANT[f.impact]}>
                        {f.impact}
                      </Badge>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{f.description}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: IMPACT_COLORS[f.impact] }}>
                    {f.weight > 0 ? "+" : ""}{f.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Recommendations ────────────────────────────── */}
      {prediction && prediction.recommendations.length > 0 && (
        <Card>
          <div style={{ padding: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: "0 0 12px 0" }}>
              <Icon name="lightbulb" size={14} /> Recommendations
            </h4>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {prediction.recommendations.map((rec, idx) => (
                <li key={idx} style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* ── Get AI Suggestions Button ──────────────────── */}
      <Button variant="primary" onClick={handleRefresh} disabled={predictWin.isPending}>
        <Icon name="sparkles" size={16} />
        Get AI Suggestions
      </Button>
    </div>
  );
}
