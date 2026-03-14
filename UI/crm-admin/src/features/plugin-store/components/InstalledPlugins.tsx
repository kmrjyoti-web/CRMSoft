"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button, Badge, Icon, Switch } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useInstalledPlugins,
  useEnablePlugin,
  useDisablePlugin,
} from "../hooks/usePluginStore";
import type { InstalledPlugin } from "../types/plugin-store.types";
import { CATEGORY_CONFIG, STATUS_BADGE } from "../types/plugin-store.types";

// ── Helpers ──────────────────────────────────────────────────────────

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
}

// ── Table styles ─────────────────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────

interface InstalledPluginsProps {
  onViewLogs?: (pluginCode: string) => void;
}

export function InstalledPlugins({ onViewLogs }: InstalledPluginsProps) {
  const router = useRouter();
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
      if (plugin.isEnabled) {
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/plugins/catalog")}
            style={{ marginTop: 12 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="plus" size={14} />
              Browse Catalog
            </span>
          </Button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Enabled</th>
                <th style={thStyle}>Errors</th>
                <th style={thStyle}>Last Used</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plugins.map((plugin) => {
                const catCfg = CATEGORY_CONFIG[plugin.category] ?? {
                  label: plugin.category,
                  icon: "zap",
                  color: "#6b7280",
                };
                const sBadge = STATUS_BADGE[plugin.status] ?? {
                  label: plugin.status,
                  variant: "secondary",
                  icon: "circle",
                };

                return (
                  <tr
                    key={plugin.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/plugins/${plugin.code}`)}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: `${catCfg.color}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon name={catCfg.icon} size={16} color={catCfg.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {plugin.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>
                            {plugin.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <Badge variant="outline" style={{ color: catCfg.color }}>
                        {catCfg.label}
                      </Badge>
                    </td>
                    <td style={tdStyle}>
                      <Badge variant={sBadge.variant as any}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon name={sBadge.icon} size={12} />
                          {sBadge.label}
                        </span>
                      </Badge>
                    </td>
                    <td style={tdStyle}>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          size="sm"
                          checked={plugin.isEnabled}
                          onChange={() => handleToggle(plugin)}
                          disabled={
                            togglingCode === plugin.code ||
                            plugin.status === "ERROR" ||
                            plugin.status === "TP_ERROR"
                          }
                        />
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {plugin.consecutiveErrors > 0 ? (
                        <Badge variant="danger">
                          {plugin.consecutiveErrors}
                        </Badge>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>0</span>
                      )}
                    </td>
                    <td style={tdStyle}>{formatDate(plugin.lastUsedAt)}</td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div
                        style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onViewLogs && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewLogs(plugin.code)}
                          >
                            <Icon name="terminal" size={14} />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/plugins/${plugin.code}`)}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="settings" size={14} />
                            Configure
                          </span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
