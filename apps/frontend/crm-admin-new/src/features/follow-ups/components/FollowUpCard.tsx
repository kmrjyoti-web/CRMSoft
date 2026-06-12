"use client";

import { useMemo } from "react";

import { Button, Badge, Icon } from "@/components/ui";

import type { FollowUp, FollowUpPriority, FollowUpStatus } from "../types/follow-ups.types";

// ── Helpers ─────────────────────────────────────────────

const PRIORITY_VARIANT: Record<FollowUpPriority, "danger" | "warning" | "primary" | "secondary"> = {
  URGENT: "danger",
  HIGH: "warning",
  MEDIUM: "primary",
  LOW: "secondary",
};

const STATUS_VARIANT: Record<FollowUpStatus, "warning" | "success" | "secondary" | "primary"> = {
  PENDING: "warning",
  COMPLETED: "success",
  CANCELLED: "secondary",
  SNOOZED: "primary",
};

function getBorderColor(followUp: FollowUp): string {
  if (followUp.status === "COMPLETED") return "#9ca3af";
  const now = new Date();
  const due = new Date(followUp.dueDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  if (dueDay < today) return "#ef4444"; // overdue - red
  if (dueDay.getTime() === today.getTime()) return "#eab308"; // today - yellow
  return "#22c55e"; // upcoming - green
}

function getRelativeDueText(dueDate: string, status: FollowUpStatus): { text: string; color: string } {
  if (status === "COMPLETED") return { text: "Completed", color: "#22c55e" };

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      text: absDays === 1 ? "1 day ago" : `${absDays} days ago`,
      color: "#ef4444",
    };
  }

  if (diffDays === 0) {
    const hours = due.getHours();
    const mins = due.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    const timeStr = mins > 0 ? `${h}:${String(mins).padStart(2, "0")} ${period}` : `${h} ${period}`;
    return { text: `Today ${timeStr}`, color: "#eab308" };
  }

  return {
    text: new Date(dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    color: "#22c55e",
  };
}

// ── Props ───────────────────────────────────────────────

interface FollowUpCardProps {
  followUp: FollowUp;
  onComplete?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onReassign?: (id: string) => void;
  onEdit?: (id: string) => void;
}

// ── Component ───────────────────────────────────────────

export function FollowUpCard({
  followUp,
  onComplete,
  onSnooze,
  onReassign,
  onEdit,
}: FollowUpCardProps) {
  const borderColor = useMemo(() => getBorderColor(followUp), [followUp]);
  const dueInfo = useMemo(
    () => getRelativeDueText(followUp.dueDate, followUp.status),
    [followUp.dueDate, followUp.status],
  );

  const ownerName = followUp.assignedTo
    ? `${followUp.assignedTo.firstName} ${followUp.assignedTo.lastName}`
    : "Unassigned";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${borderColor}`,
        marginBottom: 12,
      }}
    >
      {/* Top row: title + badges */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#111827" }}>
            {followUp.title}
          </h4>
          {followUp.entityName && (
            <span style={{ fontSize: 12, color: "#6b7280", marginTop: 2, display: "block" }}>
              {followUp.entityType}: {followUp.entityName}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <Badge variant={PRIORITY_VARIANT[followUp.priority]}>
            {followUp.priority}
          </Badge>
          <Badge variant={STATUS_VARIANT[followUp.status]}>
            {followUp.status}
          </Badge>
        </div>
      </div>

      {/* Owner + due date */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 12,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="user" size={14} />
          {ownerName}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="calendar" size={14} />
          <span style={{ color: dueInfo.color, fontWeight: 500 }}>{dueInfo.text}</span>
        </span>
      </div>

      {/* Action buttons */}
      {followUp.status !== "COMPLETED" && (
        <div style={{ display: "flex", gap: 8 }}>
          {onComplete && (
            <Button variant="outline" size="sm" onClick={() => onComplete(followUp.id)}>
              <Icon name="check" size={14} />
              <span style={{ marginLeft: 4 }}>Complete</span>
            </Button>
          )}
          {onSnooze && (
            <Button variant="outline" size="sm" onClick={() => onSnooze(followUp.id)}>
              <Icon name="clock" size={14} />
              <span style={{ marginLeft: 4 }}>Snooze</span>
            </Button>
          )}
          {onReassign && (
            <Button variant="outline" size="sm" onClick={() => onReassign(followUp.id)}>
              <Icon name="user" size={14} />
              <span style={{ marginLeft: 4 }}>Reassign</span>
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(followUp.id)}>
              <Icon name="pencil" size={14} />
              <span style={{ marginLeft: 4 }}>Edit</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
