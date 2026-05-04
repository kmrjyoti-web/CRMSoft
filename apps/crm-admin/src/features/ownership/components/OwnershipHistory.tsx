"use client";

import { useMemo } from "react";

import { Badge, Icon } from "@/components/ui";

import { useOwnershipHistory } from "../hooks/useOwnership";
import type { EntityType, OwnershipLog } from "../types/ownership.types";
import { formatDate } from "@/lib/format-date";

// ── Date formatter ─────────────────────────────────────────

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});


// ── Action label map ───────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  ASSIGN: "Assigned",
  TRANSFER: "Transferred",
  REVOKE: "Revoked",
  DELEGATE: "Delegated",
  AUTO_REVERT: "Auto-Reverted",
  ROTATION: "Rotated",
  ESCALATION: "Escalated",
};

// ── Owner type labels ──────────────────────────────────────

const OWNER_TYPE_LABELS: Record<string, string> = {
  PRIMARY_OWNER: "Primary",
  CO_OWNER: "Co-Owner",
  WATCHER: "Watcher",
  DELEGATED_OWNER: "Delegated",
  TEAM_OWNER: "Team",
};

// ── Props ──────────────────────────────────────────────────

interface OwnershipHistoryProps {
  entityType: EntityType;
  entityId: string;
}

// ── Row component ──────────────────────────────────────────

function HistoryRow({ log }: { log: OwnershipLog }) {
  const fromName = log.fromUser
    ? `${log.fromUser.firstName} ${log.fromUser.lastName}`
    : "—";
  const toName = log.toUser
    ? `${log.toUser.firstName} ${log.toUser.lastName}`
    : "—";

  return (
    <tr>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontWeight: 500, color: "#374151", fontSize: 13 }}>
          {ACTION_LABELS[log.action] ?? log.action}
        </span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {OWNER_TYPE_LABELS[log.ownerType] ?? log.ownerType}
        </span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>{fromName}</span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 13, color: "#374151" }}>{toName}</span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>
          {log.reasonCode || "—"}
        </span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
        {log.isAutomated ? (
          <Badge variant="primary">Auto</Badge>
        ) : (
          <Badge variant="secondary">Manual</Badge>
        )}
      </td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>
          {formatDate(log.createdAt)}
        </span>
      </td>
    </tr>
  );
}

// ── Component ──────────────────────────────────────────────

export function OwnershipHistory({
  entityType,
  entityId,
}: OwnershipHistoryProps) {
  const { data, isLoading, isError } = useOwnershipHistory(
    entityType,
    entityId,
  );

  const logs = useMemo(() => {
    const raw = data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  if (isLoading) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 14,
        }}
      >
        Loading ownership history...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#ef4444",
          fontSize: 14,
        }}
      >
        Failed to load ownership history.
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 14,
        }}
      >
        <Icon name="history" size={24} />
        <p style={{ marginTop: 8 }}>No ownership changes recorded.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon name="history" size={18} />
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
          Ownership History
        </h3>
        <Badge variant="secondary">{logs.length}</Badge>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Action", "Type", "From", "To", "Reason", "Mode", "Date"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <HistoryRow key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
