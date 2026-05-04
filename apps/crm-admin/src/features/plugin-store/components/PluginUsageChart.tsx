"use client";

import { useMemo } from "react";

import { Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { usePluginUsage } from "../hooks/usePluginStore";
import type { PluginUsageStats } from "../types/plugin-store.types";

// ── Usage Bar ────────────────────────────────────────────────────────

function UsageBar({ stat }: { stat: PluginUsageStats }) {
  const percent = stat.usagePercent ?? 0;
  const barColor =
    percent >= 90 ? "#dc2626" : percent >= 70 ? "#f59e0b" : "#16a34a";

  return (
    <div
      style={{
        padding: "14px 16px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="zap" size={16} color="#6366f1" />
          <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
            {stat.pluginName}
          </span>
          <Badge variant="outline" style={{ fontSize: 11 }}>{stat.category}</Badge>
        </div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          <strong>{stat.monthlyUsage.toLocaleString()}</strong>
          {stat.monthlyLimit != null && (
            <span> / {stat.monthlyLimit.toLocaleString()}</span>
          )}
        </div>
      </div>

      {stat.monthlyLimit != null ? (
        <div style={{ position: "relative", height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${Math.min(percent, 100)}%`,
              background: barColor,
              borderRadius: 4,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#9ca3af" }}>Unlimited usage</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#9ca3af" }}>
        <span>{stat.isEnabled ? "Active" : "Disabled"}</span>
        {stat.lastUsedAt && (
          <span>Last used: {new Date(stat.lastUsedAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────

export function PluginUsageChart() {
  const { data, isLoading } = usePluginUsage();

  const stats = useMemo<PluginUsageStats[]>(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
        <Icon name="bar-chart" size={40} color="#9ca3af" />
        <p style={{ margin: "8px 0 0", fontSize: 14 }}>No usage data available</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {stats.map((stat) => (
        <UsageBar key={stat.pluginCode} stat={stat} />
      ))}
    </div>
  );
}
