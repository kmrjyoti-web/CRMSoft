"use client";

import { useMemo } from "react";

import { Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { usePluginLogs } from "../hooks/usePluginStore";
import type { PluginLog } from "../types/plugin-store.types";
import { formatDate } from "@/lib/format-date";

// ── Helpers ───────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "danger";

function logStatusVariant(status: PluginLog["status"]): BadgeVariant {
  return status === "SUCCESS" ? "success" : "danger";
}


function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ── Table styles ──────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface PluginLogsProps {
  pluginCode: string;
}

export function PluginLogs({ pluginCode }: PluginLogsProps) {
  const { data, isLoading } = usePluginLogs(pluginCode);

  const logs = useMemo<PluginLog[]>(() => {
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

  const successCount = logs.filter((l) => l.status === "SUCCESS").length;
  const failCount = logs.length - successCount;
  const avgDuration =
    logs.length > 0
      ? logs.reduce((sum, l) => sum + l.duration, 0) / logs.length
      : 0;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Icon name="terminal" size={18} color="#6366f1" />
        <div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
            Plugin Logs
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginLeft: 8,
              fontFamily: "monospace",
            }}
          >
            {pluginCode}
          </span>
        </div>
        <Badge variant="secondary" style={{ marginLeft: "auto" }}>
          {logs.length} entries
        </Badge>
      </div>

      {/* Summary stats */}
      {logs.length > 0 && (
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            gap: 24,
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="check-circle" size={14} color="#16a34a" />
            <span style={{ fontSize: 13, color: "#374151" }}>
              <strong>{successCount}</strong> success
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="x-circle" size={14} color="#dc2626" />
            <span style={{ fontSize: 13, color: "#374151" }}>
              <strong>{failCount}</strong> failed
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="clock" size={14} color="#6b7280" />
            <span style={{ fontSize: 13, color: "#374151" }}>
              avg <strong>{formatDuration(Math.round(avgDuration))}</strong>
            </span>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
          <div style={{ marginBottom: 10 }}>
            <Icon name="terminal" size={40} color="#9ca3af" />
          </div>
          <p style={{ margin: 0 }}>No logs found for this plugin</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Hook Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    background:
                      log.status === "FAILURE"
                        ? "rgba(254,242,242,0.5)"
                        : undefined,
                  }}
                >
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="zap" size={13} color="#6366f1" />
                      <code
                        style={{
                          fontSize: 13,
                          fontFamily: "monospace",
                          color: "#374151",
                        }}
                      >
                        {log.hookName}
                      </code>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={logStatusVariant(log.status)}>
                      {log.status === "SUCCESS" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <Icon name="check" size={12} />
                          {log.status}
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <Icon name="x" size={12} />
                          {log.status}
                        </span>
                      )}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: log.duration > 1000 ? "#dc2626" : "#16a34a",
                        fontWeight: 500,
                      }}
                    >
                      {formatDuration(log.duration)}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12, color: "#6b7280" }}>
                    {formatDate(log.createdAt)}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.error ? (
                      <span
                        style={{
                          color: "#dc2626",
                          fontSize: 12,
                          fontFamily: "monospace",
                          background: "#fef2f2",
                          padding: "2px 6px",
                          borderRadius: 4,
                          display: "inline-block",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={log.error}
                      >
                        {log.error}
                      </span>
                    ) : (
                      <span style={{ color: "#d1d5db" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
