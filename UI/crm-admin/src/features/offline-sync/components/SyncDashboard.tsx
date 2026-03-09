"use client";

import { useMemo } from "react";
import { Button, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useSyncDashboard } from "../hooks/useOfflineSync";
import type { SyncDashboard as SyncDashboardData } from "../types/offline-sync.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMs(ms: number) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  accent?: string;
}

function StatCard({ title, value, icon, iconColor, accent }: StatCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        borderLeft: accent ? `4px solid ${accent}` : undefined,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: `${iconColor}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon as any} size={20} color={iconColor} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{title}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: "4px 0 0" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SyncDashboard() {
  const { data, isLoading, refetch } = useSyncDashboard();

  const dashboard = useMemo((): SyncDashboardData | null => {
    const raw = data?.data ?? data ?? null;
    return raw as SyncDashboardData | null;
  }, [data]);

  const entityStatus = useMemo(() => {
    const raw = dashboard?.entitySyncStatus ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [dashboard]);

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Sync Dashboard
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Overview of offline sync status across all devices
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <Icon name="refresh" size={14} />
          Refresh
        </Button>
      </div>

      {/* Device Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="Total Devices"
          value={dashboard?.totalDevices ?? 0}
          icon="smartphone"
          iconColor="#3b82f6"
          accent="#3b82f6"
        />
        <StatCard
          title="Online"
          value={dashboard?.onlineDevices ?? 0}
          icon="wifi"
          iconColor="#22c55e"
          accent="#22c55e"
        />
        <StatCard
          title="Offline"
          value={dashboard?.offlineDevices ?? 0}
          icon="monitor"
          iconColor="#f59e0b"
          accent="#f59e0b"
        />
        <StatCard
          title="Blocked"
          value={dashboard?.blockedDevices ?? 0}
          icon="shield"
          iconColor="#ef4444"
          accent="#ef4444"
        />
        <StatCard
          title="Pending Conflicts"
          value={dashboard?.pendingConflicts ?? 0}
          icon="alert-triangle"
          iconColor="#f97316"
          accent="#f97316"
        />
        <StatCard
          title="Syncs Today"
          value={dashboard?.totalSyncsToday ?? 0}
          icon="repeat"
          iconColor="#8b5cf6"
          accent="#8b5cf6"
        />
      </div>

      {/* Avg Sync Duration */}
      {(dashboard?.avgSyncDuration ?? 0) > 0 && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon name="clock" size={18} color="#16a34a" />
          <span style={{ fontSize: 14, color: "#15803d" }}>
            <strong>Avg Sync Duration:</strong>{" "}
            {fmtMs(dashboard?.avgSyncDuration ?? 0)}
          </span>
        </div>
      )}

      {/* Entity Sync Status Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #f1f5f9",
            fontSize: 14,
            fontWeight: 600,
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="layers" size={16} color="#64748b" />
          Entity Sync Status
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Entity", "Last Synced", "Record Count"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entityStatus.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 14 }}
                >
                  No entity sync data available.
                </td>
              </tr>
            ) : (
              entityStatus.map((item, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: item.lastSyncAt ? "#22c55e" : "#e2e8f0",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                        {item.entity}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>
                    {formatDate(item.lastSyncAt)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#374151",
                        background: "#f1f5f9",
                        padding: "2px 10px",
                        borderRadius: 12,
                      }}
                    >
                      {(item.recordCount ?? 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
