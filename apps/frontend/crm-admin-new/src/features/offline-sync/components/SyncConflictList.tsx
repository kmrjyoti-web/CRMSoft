"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useSyncConflicts, useResolveConflict } from "../hooks/useOfflineSync";
import type { SyncConflict, ResolveConflictDto } from "../types/offline-sync.types";
import { formatDate } from "@/lib/format-date";

// ── Helpers ──────────────────────────────────────────────────────────────────


const STATUS_CONFIG: Record<
  string,
  { variant: "warning" | "success"; label: string }
> = {
  PENDING:  { variant: "warning", label: "Pending" },
  RESOLVED: { variant: "success", label: "Resolved" },
};

// ── JSON Diff Viewer ──────────────────────────────────────────────────────────

interface JsonPanelProps {
  title: string;
  data: Record<string, unknown>;
  accentColor?: string;
}

function JsonPanel({ title, data, accentColor = "#3b82f6" }: JsonPanelProps) {
  const entries = Object.entries(data);

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        border: `1px solid ${accentColor}40`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          background: `${accentColor}12`,
          borderBottom: `1px solid ${accentColor}30`,
          fontSize: 12,
          fontWeight: 600,
          color: accentColor,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Icon name="database" size={13} color={accentColor} />
        {title}
      </div>
      <div
        style={{
          padding: 12,
          maxHeight: 320,
          overflowY: "auto",
          background: "#fafafa",
        }}
      >
        {entries.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 12 }}>No data</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              {entries.map(([key, value]) => (
                <tr key={key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td
                    style={{
                      padding: "4px 8px 4px 0",
                      color: "#64748b",
                      fontWeight: 500,
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {key}
                  </td>
                  <td
                    style={{
                      padding: "4px 0 4px 8px",
                      color: "#1e293b",
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                    }}
                  >
                    {value === null
                      ? <span style={{ color: "#94a3b8" }}>null</span>
                      : typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
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

// ── Resolve Modal ─────────────────────────────────────────────────────────────

interface ResolveModalProps {
  conflict: SyncConflict | null;
  onClose: () => void;
}

function ResolveConflictModal({ conflict, onClose }: ResolveModalProps) {
  const [resolution, setResolution] = useState<ResolveConflictDto["resolution"]>("SERVER_WINS");
  const resolveMutation = useResolveConflict();

  const handleResolve = async () => {
    if (!conflict) return;
    try {
      await resolveMutation.mutateAsync({ id: conflict.id, dto: { resolution } });
      toast.success("Conflict resolved");
      onClose();
    } catch {
      toast.error("Failed to resolve conflict");
    }
  };

  const serverData = conflict?.serverVersion ?? {};
  const clientData = conflict?.clientVersion ?? {};

  // Highlight fields that differ between server and client
  const differingKeys = Object.keys({ ...serverData, ...clientData }).filter(
    (k) => JSON.stringify(serverData[k]) !== JSON.stringify(clientData[k])
  );

  const resolutionOptions: {
    value: ResolveConflictDto["resolution"];
    label: string;
    description: string;
    color: string;
  }[] = [
    {
      value: "SERVER_WINS",
      label: "Server Wins",
      description: "Keep the server version, discard client changes",
      color: "#3b82f6",
    },
    {
      value: "CLIENT_WINS",
      label: "Client Wins",
      description: "Keep the client version, overwrite server data",
      color: "#8b5cf6",
    },
    {
      value: "MERGED",
      label: "Merged",
      description: "Mark as merged (you may provide merged data via API)",
      color: "#22c55e",
    },
  ];

  return (
    <Modal
      open={!!conflict}
      onClose={onClose}
      title={`Resolve Conflict — ${conflict?.entityName ?? ""} #${conflict?.entityId ?? ""}`}
    >
      <div style={{ padding: "8px 0" }}>
        {/* Diff View */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <JsonPanel title="Server Version" data={serverData} accentColor="#3b82f6" />
          <JsonPanel title="Client Version" data={clientData} accentColor="#8b5cf6" />
        </div>

        {/* Differing fields */}
        {differingKeys.length > 0 && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 12,
              color: "#92400e",
            }}
          >
            <strong>Conflicting fields:</strong>{" "}
            {differingKeys.map((k) => (
              <code
                key={k}
                style={{
                  background: "#fef3c7",
                  padding: "1px 5px",
                  borderRadius: 3,
                  marginLeft: 4,
                }}
              >
                {k}
              </code>
            ))}
          </div>
        )}

        {/* Resolution Radio */}
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
          Choose Resolution
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {resolutionOptions.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
                border: `2px solid ${resolution === opt.value ? opt.color : "#e2e8f0"}`,
                background: resolution === opt.value ? `${opt.color}08` : "#fff",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name="resolution"
                value={opt.value}
                checked={resolution === opt.value}
                onChange={() => setResolution(opt.value)}
                style={{ marginTop: 2 }}
              />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: opt.color }}>
                  {opt.label}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                  {opt.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleResolve}
            disabled={resolveMutation.isPending}
          >
            {resolveMutation.isPending ? <LoadingSpinner size="sm" /> : "Resolve Conflict"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SyncConflictList() {
  const [resolveConflict, setResolveConflict] = useState<SyncConflict | null>(null);

  const { data, isLoading, refetch } = useSyncConflicts();

  const conflicts = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]) as SyncConflict[];

  const pendingCount = conflicts.filter((c) => c.status === "PENDING").length;

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Sync Conflicts
            </h2>
            {pendingCount > 0 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  background: "#f97316",
                  padding: "2px 8px",
                  borderRadius: 10,
                }}
              >
                {pendingCount} pending
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Review and resolve data conflicts between server and client
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <Icon name="refresh" size={14} />
          Refresh
        </Button>
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
              {["Entity", "Entity ID", "Device", "Status", "Created", "Actions"].map((h) => (
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
            {conflicts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <Icon name="check-circle" size={32} color="#22c55e" />
                    <p style={{ margin: 0 }}>No sync conflicts. Everything is in sync!</p>
                  </div>
                </td>
              </tr>
            ) : (
              conflicts.map((conflict) => {
                const statusCfg = STATUS_CONFIG[conflict.status] ?? {
                  variant: "secondary" as const,
                  label: conflict.status,
                };
                const isPending = conflict.status === "PENDING";

                return (
                  <tr
                    key={conflict.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: isPending ? "#fffbeb" : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isPending ? "#fef3c7" : "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isPending ? "#fffbeb" : "transparent")
                    }
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon name="layers" size={14} color="#64748b" />
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                          {conflict.entityName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <code
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          background: "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: 4,
                          color: "#475569",
                        }}
                      >
                        {conflict.entityId}
                      </code>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>
                      {conflict.deviceId}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge variant={statusCfg.variant} style={{ fontSize: 12 }}>
                        {statusCfg.label}
                      </Badge>
                      {conflict.resolution && (
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8" }}>
                          {conflict.resolution.replace("_", " ")}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#64748b" }}>
                      {formatDate(conflict.createdAt)}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {isPending ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setResolveConflict(conflict)}
                        >
                          <Icon name="check" size={13} />
                          Resolve
                        </Button>
                      ) : (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          Resolved by {conflict.resolvedBy ?? "system"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ResolveConflictModal
        conflict={resolveConflict}
        onClose={() => setResolveConflict(null)}
      />
    </div>
  );
}
