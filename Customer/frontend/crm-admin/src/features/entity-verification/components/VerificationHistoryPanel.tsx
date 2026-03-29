"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { useVerificationHistory } from "../hooks/useEntityVerification";

// ── Verification History Panel (collapsible previous attempts) ──────────────

export interface VerificationHistoryPanelProps {
  entityType: string;
  entityId: string;
}

export function VerificationHistoryPanel({
  entityType,
  entityId,
}: VerificationHistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const { data: history } = useVerificationHistory(entityType, entityId);
  const recent = history?.slice(0, 3) ?? [];

  if (recent.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 16,
        borderTop: "1px solid #f3f4f6",
        paddingTop: 12,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: "#6b7280",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        <Icon name={open ? "chevron-down" : "chevron-right"} size={13} />
        Previous Attempts ({recent.length})
      </button>
      {open && (
        <div style={{ marginTop: 8 }}>
          {recent.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 0",
                fontSize: 12,
                borderBottom: "1px solid #f9fafb",
              }}
            >
              <span style={{ color: "#4b5563" }}>
                {r.mode} via {r.channel}
              </span>
              <span
                style={{
                  color:
                    r.status === "VERIFIED"
                      ? "#15803d"
                      : r.status === "FAILED" || r.status === "REJECTED"
                      ? "#b91c1c"
                      : "#92400e",
                  fontWeight: 500,
                }}
              >
                {r.status}
              </span>
              <span style={{ color: "#9ca3af" }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
