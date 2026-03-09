"use client";

import { useMemo } from "react";

import { Icon, Badge } from "@/components/ui";

import type { Email, EmailStatus } from "../types/email.types";

// ── Props ─────────────────────────────────────────────────

interface EmailItemProps {
  email: Email;
  onSelect?: (id: string) => void;
  onToggleStar?: (id: string) => void;
}

// ── Status badge mapping ──────────────────────────────────

const STATUS_BADGE_MAP: Record<EmailStatus, { label: string; variant: "success" | "warning" | "danger" | "secondary" | "primary" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  QUEUED: { label: "Queued", variant: "outline" },
  SCHEDULED: { label: "Scheduled", variant: "primary" },
  SENDING: { label: "Sending", variant: "primary" },
  SENT: { label: "Sent", variant: "success" },
  DELIVERED: { label: "Delivered", variant: "success" },
  OPENED: { label: "Opened", variant: "success" },
  CLICKED: { label: "Clicked", variant: "success" },
  BOUNCED: { label: "Bounced", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "warning" },
  FAILED: { label: "Failed", variant: "danger" },
};

// ── Relative date formatting ──────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── Component ─────────────────────────────────────────────

export function EmailItem({ email, onSelect, onToggleStar }: EmailItemProps) {
  const statusBadge = STATUS_BADGE_MAP[email.status] ?? { label: email.status, variant: "secondary" as const };

  const displayName = useMemo(() => {
    if (email.direction === "INBOUND") {
      return email.fromName ?? email.from;
    }
    return email.toNames?.[0] ?? email.to?.[0] ?? "Unknown";
  }, [email]);

  const truncatedSubject = useMemo(() => {
    if (!email.subject) return "(No subject)";
    return email.subject.length > 60
      ? email.subject.slice(0, 60) + "..."
      : email.subject;
  }, [email.subject]);

  const dateStr = email.sentAt ?? email.createdAt;

  return (
    <div
      onClick={() => onSelect?.(email.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid #f3f4f6",
        cursor: "pointer",
        background: email.isRead ? "#fff" : "#f8faff",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "#f1f5f9";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = email.isRead ? "#fff" : "#f8faff";
      }}
    >
      {/* Star */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar?.(email.id);
        }}
        style={{ cursor: "pointer", flexShrink: 0 }}
      >
        <Icon
          name="star"
          size={18}
          color={email.isStarred ? "#f59e0b" : "#d1d5db"}
          fill={email.isStarred ? "#f59e0b" : "none"}
        />
      </div>

      {/* Unread indicator */}
      <div style={{ width: 8, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        {!email.isRead && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#3b82f6",
            }}
          />
        )}
      </div>

      {/* From / To */}
      <div
        style={{
          width: 180,
          flexShrink: 0,
          fontSize: 14,
          fontWeight: email.isRead ? 400 : 600,
          color: "#1e293b",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {displayName}
      </div>

      {/* Subject */}
      <div
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: email.isRead ? 400 : 600,
          color: "#1e293b",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {truncatedSubject}
      </div>

      {/* Attachment icon */}
      {email.attachments?.length > 0 && (
        <div style={{ flexShrink: 0 }}>
          <Icon name="paperclip" size={14} color="#9ca3af" />
        </div>
      )}

      {/* Status badge */}
      <div style={{ flexShrink: 0 }}>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </div>

      {/* Date */}
      <div
        style={{
          width: 72,
          flexShrink: 0,
          fontSize: 12,
          color: "#6b7280",
          textAlign: "right",
        }}
      >
        {formatRelativeDate(dateStr)}
      </div>
    </div>
  );
}
