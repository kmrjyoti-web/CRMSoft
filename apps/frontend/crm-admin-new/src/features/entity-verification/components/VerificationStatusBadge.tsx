"use client";
import type { EntityVerifStatus } from "../types/entity-verification.types";

const CONFIG: Record<
  EntityVerifStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  VERIFIED:   { label: "Verified",   color: "#15803d", bg: "#dcfce7", dot: "🟢" },
  PENDING:    { label: "Pending",    color: "#92400e", bg: "#fef9c3", dot: "🟡" },
  UNVERIFIED: { label: "Unverified", color: "#4b5563", bg: "#f3f4f6", dot: "⚪" },
  REJECTED:   { label: "Rejected",   color: "#b91c1c", bg: "#fee2e2", dot: "🔴" },
};

export function VerificationStatusBadge({
  status,
  size = "sm",
}: {
  status: EntityVerifStatus | string;
  size?: "sm" | "md";
}) {
  const cfg = CONFIG[status as EntityVerifStatus] ?? CONFIG.UNVERIFIED;
  const padding = size === "sm" ? "2px 8px" : "4px 12px";
  const fontSize = size === "sm" ? 11 : 13;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding,
        background: cfg.bg,
        color: cfg.color,
        borderRadius: 20,
        fontSize,
        fontWeight: 500,
        border: `1px solid ${cfg.color}22`,
      }}
    >
      <span style={{ fontSize: size === "sm" ? 8 : 10 }}>{cfg.dot}</span>
      {cfg.label}
    </span>
  );
}
