"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Badge, Icon, Switch } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useInstalledPlugins,
  useEnablePlugin,
  useDisablePlugin,
} from "../hooks/usePluginStore";
import type { InstalledPlugin } from "../types/plugin-store.types";

// ── Status helpers ────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "secondary" | "danger";

function pluginStatusVariant(status: InstalledPlugin["status"]): BadgeVariant {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "DISABLED":
      return "secondary";
    case "ERROR":
      return "danger";
    default:
      return "secondary";
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
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

interface InstalledPluginsProps {
  onViewLogs?: (pluginCode: string) => void;
}

export function InstalledPlugins({ onViewLogs }: InstalledPluginsProps) {
  const { data, isLoading } = useInstalledPlugins();
  const enableMutation = useEnablePlugin();
  const disableMutation = useDisablePlugin();
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  const plugins = useMemo<InstalledPlugin[]>(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleToggle = async (plugin: InstalledPlugin) => {
    if (togglingCode) return;
    setTogglingCode(plugin.code);
    try {
      if (plugin.status === "ACTIVE") {
        await disableMutation.mutateAsync(plugin.code);
        toast.success(`"${plugin.name}" disabled`);
      } else {
        await enableMutation.mutateAsync(plugin.code);
        toast.success(`"${plugin.name}" enabled`);
      }
    } catch {
      toast.error("Failed to update plugin status");
    } finally {
      setTogglingCode(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <LoadingSpinner />
      </div>
    );
  }

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
        <Icon name="zap" size={18} color="#16a34a" />
        <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
          Installed Plugins
        </span>
        <Badge variant="secondary" style={{ marginLeft: "auto" }}>
          {plugins.length}
        </Badge>
      </div>

      {plugins.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
          <div style={{ marginBottom: 10 }}>
            <Icon name="zap" size={40} color="#9ca3af" />
          </div>
          <p style={{ margin: 0 }}>No plugins installed yet</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Enabled</th>
                <th style={thStyle}>Last Used</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plugins.map((plugin) => (
                <tr key={plugin.id}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "#f0fdf4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="zap" size={16} color="#16a34a" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {plugin.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>
                          v{plugin.version}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <code
                      style={{
                        background: "#f3f4f6",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: "monospace",
                      }}
                    >
                      {plugin.code}
                    </code>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant="outline">{plugin.category}</Badge>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={pluginStatusVariant(plugin.status)}>
                      {plugin.status === "ERROR" && (
                        <span style={{ display: "inline-flex", marginRight: 4 }}>
                          <Icon name="alert-circle" size={12} />
                        </span>
                      )}
                      {plugin.status}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        size="sm"
                        checked={plugin.status === "ACTIVE"}
                        onChange={() => handleToggle(plugin)}
                        disabled={
                          togglingCode === plugin.code ||
                          plugin.status === "ERROR"
                        }
                      />
                    </div>
                  </td>
                  <td style={tdStyle}>{formatDate(plugin.lastUsedAt)}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {onViewLogs && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewLogs(plugin.code)}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="terminal" size={14} />
                            Logs
                          </span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(plugin)}
                        disabled={
                          togglingCode === plugin.code ||
                          plugin.status === "ERROR"
                        }
                      >
                        {plugin.status === "ACTIVE" ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="pause" size={14} />
                            Disable
                          </span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="play" size={14} />
                            Enable
                          </span>
                        )}
                      </Button>
                    </div>
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
