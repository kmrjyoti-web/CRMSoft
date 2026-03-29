"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useInstalledModules,
  useActivateModule,
  useUninstallModule,
} from "../hooks/useMarketplace";
import type { InstalledModule } from "../types/marketplace.types";
import { formatDate } from "@/lib/format-date";

// ── Status helpers ────────────────────────────────────────────────────────────

type StatusVariant = "success" | "warning" | "danger" | "secondary";

function statusVariant(status: InstalledModule["status"]): StatusVariant {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "TRIAL":
      return "warning";
    case "EXPIRED":
      return "danger";
    case "CANCELLED":
      return "secondary";
    default:
      return "secondary";
  }
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

export function InstalledModules() {
  const { data, isLoading } = useInstalledModules();
  const activateMutation = useActivateModule();
  const uninstallMutation = useUninstallModule();
  const [actionId, setActionId] = useState<string | null>(null);

  const modules = useMemo<InstalledModule[]>(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleActivate = async (id: string) => {
    setActionId(id);
    try {
      await activateMutation.mutateAsync(id);
      toast.success("Module activated");
    } catch {
      toast.error("Failed to activate module");
    } finally {
      setActionId(null);
    }
  };

  const handleUninstall = async (id: string, name: string) => {
    if (!window.confirm(`Uninstall "${name}"? This cannot be undone.`)) return;
    setActionId(id);
    try {
      await uninstallMutation.mutateAsync(id);
      toast.success("Module uninstalled");
    } catch {
      toast.error("Failed to uninstall module");
    } finally {
      setActionId(null);
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
        <Icon name="package" size={18} color="#6366f1" />
        <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
          Installed Modules
        </span>
        <Badge variant="secondary" style={{ marginLeft: "auto" }}>
          {modules.length}
        </Badge>
      </div>

      {modules.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <Icon name="package" size={40} color="#9ca3af" />
          </div>
          <p style={{ margin: 0 }}>No modules installed yet</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Module Name</th>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Installed At</th>
                <th style={thStyle}>Trial Ends</th>
                <th style={thStyle}>Subscription Ends</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod.id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>
                    {mod.moduleName}
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
                      {mod.moduleCode}
                    </code>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={statusVariant(mod.status)}>
                      {mod.status}
                    </Badge>
                  </td>
                  <td style={tdStyle}>{formatDate(mod.installedAt)}</td>
                  <td style={tdStyle}>{mod.trialEndsAt ? formatDate(mod.trialEndsAt) : "—"}</td>
                  <td style={tdStyle}>{mod.subscriptionEndsAt ? formatDate(mod.subscriptionEndsAt) : "—"}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      {mod.status !== "ACTIVE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionId === mod.id}
                          onClick={() => handleActivate(mod.id)}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="check" size={14} />
                            Activate
                          </span>
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={actionId === mod.id}
                        onClick={() => handleUninstall(mod.id, mod.moduleName)}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon name="trash" size={14} />
                          Uninstall
                        </span>
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
