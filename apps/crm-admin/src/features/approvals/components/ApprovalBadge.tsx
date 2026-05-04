"use client";

import { Badge, Icon } from "@/components/ui";

import type { ApprovalStatus } from "../types/approval.types";

// ── Status Config ───────────────────────────────────────

const STATUS_CONFIG: Record<
  ApprovalStatus,
  { variant: "warning" | "success" | "danger"; icon: "clock" | "check-circle" | "x-circle" }
> = {
  PENDING: { variant: "warning", icon: "clock" },
  APPROVED: { variant: "success", icon: "check-circle" },
  REJECTED: { variant: "danger", icon: "x-circle" },
};

// ── Props ───────────────────────────────────────────────

interface ApprovalBadgeProps {
  status: ApprovalStatus;
}

// ── Component ───────────────────────────────────────────

export function ApprovalBadge({ status }: ApprovalBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <Badge variant={config.variant}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <Icon name={config.icon} size={12} />
        {status}
      </span>
    </Badge>
  );
}
