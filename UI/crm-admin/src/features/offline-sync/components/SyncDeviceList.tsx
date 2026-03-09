"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useSyncDevices, useBlockDevice } from "../hooks/useOfflineSync";
import type { SyncDevice } from "../types/offline-sync.types";

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

const STATUS_CONFIG: Record<
  string,
  { variant: "success" | "warning" | "danger"; label: string; dot: string }
> = {
  ONLINE:  { variant: "success", label: "Online",  dot: "#22c55e" },
  OFFLINE: { variant: "warning", label: "Offline", dot: "#f59e0b" },
  BLOCKED: { variant: "danger",  label: "Blocked", dot: "#ef4444" },
};

const PLATFORM_COLORS: Record<string, string> = {
  android: "#3ddc84",
  ios:     "#000000",
  web:     "#3b82f6",
  desktop: "#8b5cf6",
};

function PlatformBadge({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  const color = PLATFORM_COLORS[p] ?? "#64748b";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        fontWeight: 500,
        color,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        padding: "2px 8px",
        borderRadius: 10,
        textTransform: "capitalize",
      }}
    >
      <Icon
        name={
          p === "ios" || p === "android"
            ? "smartphone"
            : p === "web"
            ? "globe"
            : "monitor"
        }
        size={12}
        color={color}
      />
      {platform}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SyncDeviceList() {
  const { data, isLoading, refetch } = useSyncDevices();
  const blockMutation = useBlockDevice();

  const devices = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]) as SyncDevice[];

  const handleBlock = async (device: SyncDevice) => {
    if (
      !confirm(
        `Block device "${device.deviceName}"? It will no longer be able to sync.`
      )
    )
      return;
    try {
      await blockMutation.mutateAsync(device.id);
      toast.success(`Device "${device.deviceName}" blocked`);
    } catch {
      toast.error("Failed to block device");
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;
  const offlineCount = devices.filter((d) => d.status === "OFFLINE").length;
  const blockedCount = devices.filter((d) => d.status === "BLOCKED").length;

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
            Sync Devices
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Monitor and manage devices using offline sync
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <Icon name="refresh" size={14} />
          Refresh
        </Button>
      </div>

      {/* Summary Strip */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Total", value: devices.length, color: "#64748b" },
          { label: "Online", value: onlineCount, color: "#22c55e" },
          { label: "Offline", value: offlineCount, color: "#f59e0b" },
          { label: "Blocked", value: blockedCount, color: "#ef4444" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: s.color,
                display: "inline-block",
              }}
            />
            <span style={{ color: "#64748b" }}>{s.label}:</span>
            <strong style={{ color: "#0f172a" }}>{s.value}</strong>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {[
                "Device",
                "Platform",
                "User",
                "Last Sync",
                "Last Heartbeat",
                "Status",
                "Synced",
                "Pending",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e2e8f0",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}
                >
                  No devices registered for offline sync.
                </td>
              </tr>
            ) : (
              devices.map((device) => {
                const statusCfg = STATUS_CONFIG[device.status] ?? {
                  variant: "secondary" as const,
                  label: device.status,
                  dot: "#64748b",
                };
                return (
                  <tr
                    key={device.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                          {device.deviceName}
                        </span>
                        {device.appVersion && (
                          <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                            v{device.appVersion}
                          </p>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <PlatformBadge platform={device.platform} />
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                      {device.userName ?? device.userId}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                      {formatDate(device.lastSyncAt)}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                      {formatDate(device.lastHeartbeatAt)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: statusCfg.dot,
                            flexShrink: 0,
                          }}
                        />
                        <Badge variant={statusCfg.variant} style={{ fontSize: 12 }}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151", fontWeight: 500 }}>
                      {(device.syncedRecordCount ?? 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {(device.pendingPushCount ?? 0) > 0 ? (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#f59e0b",
                            background: "#fef3c7",
                            padding: "2px 8px",
                            borderRadius: 10,
                          }}
                        >
                          {device.pendingPushCount}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {device.status !== "BLOCKED" ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleBlock(device)}
                          disabled={blockMutation.isPending}
                        >
                          <Icon name="shield" size={13} />
                          Block
                        </Button>
                      ) : (
                        <Badge variant="danger" style={{ fontSize: 12 }}>
                          Blocked
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
