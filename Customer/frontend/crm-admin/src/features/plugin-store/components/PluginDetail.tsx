"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  usePluginCatalogItem,
  useInstalledPlugin,
  useInstallPlugin,
  useEnablePlugin,
  useDisablePlugin,
  useUninstallPlugin,
  useUpdatePluginCredentials,
} from "../hooks/usePluginStore";
import {
  CATEGORY_CONFIG,
  STATUS_BADGE,
} from "../types/plugin-store.types";
import type {
  PluginConfigField,
  PluginSettingField,
} from "../types/plugin-store.types";

import { CredentialForm } from "./CredentialForm";
import { TestConnectionButton } from "./TestConnectionButton";
import { PluginSettingsForm } from "./PluginSettingsForm";
import { PluginLogs } from "./PluginLogs";
import { PluginUsageChart } from "./PluginUsageChart";
import { UninstallConfirmDialog } from "./UninstallConfirmDialog";

// ── Types ────────────────────────────────────────────────────────────

type TabId = "overview" | "credentials" | "settings" | "logs" | "health";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: "info" },
  { id: "credentials", label: "Credentials", icon: "key" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "logs", label: "Logs", icon: "terminal" },
  { id: "health", label: "Health & Usage", icon: "activity" },
];

// ── Component ────────────────────────────────────────────────────────

interface PluginDetailProps {
  pluginCode: string;
}

export function PluginDetail({ pluginCode }: PluginDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [uninstallOpen, setUninstallOpen] = useState(false);

  const { data: catalogData, isLoading: catalogLoading } = usePluginCatalogItem(pluginCode);
  const { data: installedData, isLoading: installedLoading } = useInstalledPlugin(pluginCode);

  const installMutation = useInstallPlugin();
  const enableMutation = useEnablePlugin();
  const disableMutation = useDisablePlugin();
  const uninstallMutation = useUninstallPlugin();
  const updateCredsMutation = useUpdatePluginCredentials();

  const plugin = useMemo(() => {
    const raw = (catalogData as any)?.data ?? catalogData;
    return raw ?? null;
  }, [catalogData]);

  const installed = useMemo(() => {
    const raw = (installedData as any)?.data ?? installedData;
    return raw ?? null;
  }, [installedData]);

  const isInstalled = installed != null;
  const isLoading = catalogLoading || installedLoading;

  // Config fields from catalog
  const configFields = useMemo<PluginConfigField[]>(() => {
    return plugin?.configSchema?.fields ?? [];
  }, [plugin]);

  const settingFields = useMemo<PluginSettingField[]>(() => {
    return plugin?.settingFields ?? [];
  }, [plugin]);

  const categoryConfig = CATEGORY_CONFIG[plugin?.category ?? ""] ?? {
    label: plugin?.category ?? "",
    icon: "zap",
    color: "#6b7280",
  };

  const statusBadge = STATUS_BADGE[installed?.status ?? ""] ?? null;

  // ── Handlers ────────────────────────────────────────────

  const handleInstall = async (credentials: Record<string, string>) => {
    try {
      await installMutation.mutateAsync({
        code: pluginCode,
        dto: { credentials: Object.keys(credentials).length ? credentials : undefined },
      });
      toast.success("Plugin installed successfully");
    } catch {
      toast.error("Failed to install plugin");
    }
  };

  const handleUpdateCredentials = async (credentials: Record<string, string>) => {
    try {
      await updateCredsMutation.mutateAsync({ code: pluginCode, dto: { credentials } });
      toast.success("Credentials updated");
    } catch {
      toast.error("Failed to update credentials");
    }
  };

  const handleToggle = async () => {
    try {
      if (installed?.isEnabled) {
        await disableMutation.mutateAsync(pluginCode);
        toast.success("Plugin disabled");
      } else {
        await enableMutation.mutateAsync(pluginCode);
        toast.success("Plugin enabled");
      }
    } catch {
      toast.error("Failed to update plugin status");
    }
  };

  const handleUninstall = async () => {
    try {
      await uninstallMutation.mutateAsync(pluginCode);
      toast.success("Plugin uninstalled");
      router.push("/plugins/catalog");
    } catch {
      toast.error("Failed to uninstall plugin");
    }
  };

  // ── Loading ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!plugin) {
    return (
      <div style={{ textAlign: "center", padding: 64, color: "#9ca3af" }}>
        <Icon name="alert-circle" size={48} color="#9ca3af" />
        <p style={{ margin: "12px 0 0", fontSize: 16 }}>Plugin not found</p>
        <Button variant="outline" onClick={() => router.push("/plugins/catalog")} style={{ marginTop: 16 }}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            marginTop: 4,
          }}
        >
          <Icon name="arrow-left" size={20} color="#6b7280" />
        </button>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `${categoryConfig.color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={categoryConfig.icon} size={28} color={categoryConfig.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>
              {plugin.name}
            </h1>
            {plugin.isPremium && (
              <Badge variant="warning">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="crown" size={12} />
                  Premium
                </span>
              </Badge>
            )}
            {statusBadge && (
              <Badge variant={statusBadge.variant as any}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name={statusBadge.icon} size={12} />
                  {statusBadge.label}
                </span>
              </Badge>
            )}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
            {plugin.description}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <Badge variant="outline">
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name={categoryConfig.icon} size={12} />
                {categoryConfig.label}
              </span>
            </Badge>
            <Badge variant="outline">v{plugin.version}</Badge>
            {plugin.hookPoints && plugin.hookPoints.length > 0 && (
              <Badge variant="outline">{plugin.hookPoints.length} hooks</Badge>
            )}
            {plugin.author && (
              <Badge variant="secondary">by {plugin.author}</Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {isInstalled ? (
            <>
              <Button
                variant={installed.isEnabled ? "outline" : "primary"}
                size="sm"
                onClick={handleToggle}
                disabled={enableMutation.isPending || disableMutation.isPending}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name={installed.isEnabled ? "pause" : "play"} size={14} />
                  {installed.isEnabled ? "Disable" : "Enable"}
                </span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setUninstallOpen(true)}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="trash-2" size={14} />
                  Uninstall
                </span>
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={() => setActiveTab("credentials")}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="download" size={14} />
                Install Plugin
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#2563eb" : "#6b7280",
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
                marginBottom: -2,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icon name={tab.icon} size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ minHeight: 200 }}>
        {activeTab === "overview" && (
          <OverviewTab
            plugin={plugin}
            installed={installed}
            categoryConfig={categoryConfig}
          />
        )}

        {activeTab === "credentials" && (
          <div style={{ maxWidth: 560 }}>
            {isInstalled ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  Update Credentials
                </h3>
                <CredentialForm
                  fields={configFields}
                  onSubmit={handleUpdateCredentials}
                  submitLabel="Update Credentials"
                  isUpdate
                />
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                  <TestConnectionButton pluginCode={pluginCode} />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  Install — Enter Credentials
                </h3>
                <CredentialForm
                  fields={configFields}
                  onSubmit={handleInstall}
                  submitLabel="Install Plugin"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div style={{ maxWidth: 560 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
              Plugin Settings
            </h3>
            {isInstalled ? (
              <PluginSettingsForm
                pluginCode={pluginCode}
                fields={settingFields}
                currentSettings={installed.settings as Record<string, unknown>}
              />
            ) : (
              <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                Install this plugin first to configure settings.
              </div>
            )}
          </div>
        )}

        {activeTab === "logs" && (
          isInstalled ? (
            <PluginLogs pluginCode={pluginCode} />
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
              Install this plugin to view execution logs.
            </div>
          )
        )}

        {activeTab === "health" && (
          isInstalled ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  Connection Health
                </h3>
                <TestConnectionButton pluginCode={pluginCode} />
                {installed.lastError && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#b91c1c", marginBottom: 4 }}>
                      Last Error ({installed.consecutiveErrors} consecutive)
                    </div>
                    <code style={{ color: "#991b1b", fontSize: 12 }}>{installed.lastError}</code>
                    {installed.lastErrorAt && (
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                        {new Date(installed.lastErrorAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  Usage
                </h3>
                <PluginUsageChart />
              </div>
            </div>
          ) : (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
              Install this plugin to view health and usage data.
            </div>
          )
        )}
      </div>

      {/* Uninstall Dialog */}
      <UninstallConfirmDialog
        open={uninstallOpen}
        onClose={() => setUninstallOpen(false)}
        pluginName={plugin.name}
        pluginCode={pluginCode}
        onConfirm={handleUninstall}
      />
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────

function OverviewTab({
  plugin,
  installed,
  categoryConfig,
}: {
  plugin: any;
  installed: any;
  categoryConfig: { label: string; icon: string; color: string };
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Info card */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          background: "#fff",
        }}
      >
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#111827" }}>
          Plugin Information
        </h3>
        <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <InfoRow label="Code" value={plugin.code} mono />
          <InfoRow label="Category" value={categoryConfig.label} />
          <InfoRow label="Version" value={plugin.version} />
          <InfoRow label="Requires Credentials" value={plugin.requiresCredentials ? "Yes" : "No"} />
          {plugin.monthlyPrice != null && (
            <InfoRow label="Price" value={`$${plugin.monthlyPrice}/mo`} />
          )}
        </dl>
      </div>

      {/* Hook points */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          background: "#fff",
        }}
      >
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#111827" }}>
          Hook Points
        </h3>
        {plugin.hookPoints && plugin.hookPoints.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {plugin.hookPoints.map((hook: string) => (
              <Badge key={hook} variant="outline">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="zap" size={11} />
                  {hook}
                </span>
              </Badge>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>No hook points configured</p>
        )}

        {plugin.menuCodes && plugin.menuCodes.length > 0 && (
          <>
            <h4 style={{ margin: "16px 0 8px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
              Menu Items
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {plugin.menuCodes.map((code: string) => (
                <Badge key={code} variant="secondary">
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="menu" size={11} />
                    {code}
                  </span>
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Installation status */}
      {installed && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            background: "#fff",
            gridColumn: "1 / -1",
          }}
        >
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#111827" }}>
            Installation Status
          </h3>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <InfoRow label="Status" value={installed.status} />
            <InfoRow label="Enabled" value={installed.isEnabled ? "Yes" : "No"} />
            <InfoRow label="Installed At" value={new Date(installed.installedAt).toLocaleDateString()} />
            <InfoRow label="Last Used" value={installed.lastUsedAt ? new Date(installed.lastUsedAt).toLocaleDateString() : "Never"} />
            <InfoRow label="Monthly Usage" value={String(installed.monthlyUsage)} />
            <InfoRow label="Error Count" value={String(installed.errorCount)} />
            {installed.webhookUrl && (
              <div style={{ gridColumn: "1 / -1" }}>
                <InfoRow label="Webhook URL" value={installed.webhookUrl} mono />
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}

// ── Info Row ─────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <dt style={{ fontSize: 13, color: "#6b7280" }}>{label}</dt>
      <dd
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 500,
          color: "#111827",
          fontFamily: mono ? "monospace" : undefined,
          background: mono ? "#f3f4f6" : undefined,
          padding: mono ? "2px 8px" : undefined,
          borderRadius: mono ? 4 : undefined,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
