"use client";

import { useState, useMemo } from "react";

import { SelectInput, Icon, Badge } from "@/components/ui";

import { useLeaderboard } from "../hooks/usePerformance";
import type { LeaderboardEntry } from "../types/performance.types";

// ── Helpers ─────────────────────────────────────────────

function getRankStyle(rank: number): React.CSSProperties {
  if (rank === 1) return { color: "#ca8a04", fontWeight: 700 }; // Gold
  if (rank === 2) return { color: "#6b7280", fontWeight: 700 }; // Silver
  if (rank === 3) return { color: "#b45309", fontWeight: 700 }; // Bronze
  return { color: "#374151", fontWeight: 500 };
}

function getChangeIndicator(entry: LeaderboardEntry): React.ReactNode {
  if (entry.change === "UP") {
    return (
      <span style={{ color: "#22c55e", display: "inline-flex", alignItems: "center", gap: 2 }}>
        <Icon name="arrow-up" size={14} />
      </span>
    );
  }
  if (entry.change === "DOWN") {
    return (
      <span style={{ color: "#ef4444", display: "inline-flex", alignItems: "center", gap: 2 }}>
        <Icon name="arrow-down" size={14} />
      </span>
    );
  }
  return <span style={{ color: "#9ca3af" }}>--</span>;
}

// ── Component ───────────────────────────────────────────

export function Leaderboard() {
  const [period, setPeriod] = useState("MONTHLY");

  const { data, isLoading } = useLeaderboard({ period });

  const entries = useMemo(() => {
    const raw = data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const periodOptions = [
    { label: "Weekly", value: "WEEKLY" },
    { label: "Monthly", value: "MONTHLY" },
    { label: "Quarterly", value: "QUARTERLY" },
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
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Leaderboard</h1>
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

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
          overflowX: "auto",
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
            Loading leaderboard...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
            <Icon name="trophy" size={40} />
            <p style={{ marginTop: 12, fontSize: 14 }}>No leaderboard data available.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #e5e7eb",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Rank
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Name
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Department
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "right" }}>
                  Leads
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "right" }}>
                  Converted
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "right" }}>
                  Revenue
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "right" }}>
                  Activities
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "right" }}>
                  Score
                </th>
                <th style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "center" }}>
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.userId}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    background: entry.rank <= 3 ? "#fffbeb" : "transparent",
                  }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        ...getRankStyle(entry.rank),
                      }}
                    >
                      {entry.rank <= 3 && <Icon name="trophy" size={16} />}
                      <span>{entry.rank}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 500, fontSize: 14 }}>
                    {entry.userName}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#6b7280" }}>
                    {entry.department ?? "--"}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14 }}>
                    {entry.leadsCreated}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14 }}>
                    {entry.leadsConverted}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14 }}>
                    {entry.revenue.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14 }}>
                    {entry.activities}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14, fontWeight: 600 }}>
                    {entry.score}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    {getChangeIndicator(entry)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
