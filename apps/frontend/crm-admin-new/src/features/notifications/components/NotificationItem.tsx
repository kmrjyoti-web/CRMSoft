"use client";

import { Icon } from "@/components/ui";
import type { Notification, NotificationCategory } from "../types/notifications.types";

// ── Category → icon mapping ──────────────────────────────

const CATEGORY_ICON: Record<string, Parameters<typeof Icon>[0]["name"]> = {
  LEAD_ASSIGNED: "target",
  LEAD_UPDATED: "edit",
  OWNERSHIP_CHANGED: "user-check",
  DEMO_SCHEDULED: "calendar",
  DEMO_COMPLETED: "check-circle",
  FOLLOW_UP_DUE: "clock",
  FOLLOW_UP_OVERDUE: "alert-triangle",
  QUOTATION_SENT: "file-text",
  QUOTATION_APPROVED: "check-circle",
  TOUR_PLAN_APPROVED: "map",
  ACTIVITY_REMINDER: "bell",
  DELEGATION_STARTED: "user-plus",
  DELEGATION_ENDED: "user-x",
  SYSTEM_ALERT: "alert-circle",
  WORKFLOW_ACTION: "zap",
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "#6b7280",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Props ────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClick?: (notification: Notification) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
  onClick,
  compact = false,
}: NotificationItemProps) {
  const isUnread = notification.status === "UNREAD";
  const iconName = CATEGORY_ICON[notification.category] || "bell";
  const priorityColor = PRIORITY_COLOR[notification.priority] || PRIORITY_COLOR.MEDIUM;

  return (
    <div
      className={`notif-item${isUnread ? " notif-item--unread" : ""}${compact ? " notif-item--compact" : ""}`}
      style={{
        display: "flex",
        gap: 12,
        padding: compact ? "10px 12px" : "14px 16px",
        borderBottom: "1px solid #f0f0f0",
        cursor: onClick ? "pointer" : "default",
        backgroundColor: isUnread ? "#f0f7ff" : "transparent",
        transition: "background-color 0.15s",
      }}
      onClick={() => onClick?.(notification)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${priorityColor}14`,
          color: priorityColor,
          flexShrink: 0,
        }}
      >
        <Icon name={iconName} size={18} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: isUnread ? 600 : 400,
            color: "#1a1a1a",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {notification.title}
        </p>
        {!compact && notification.message && (
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              margin: "2px 0 0",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {notification.message}
          </p>
        )}
        <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" }}>
          {timeAgo(notification.createdAt)}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "flex-start" }}>
        {isUnread && onMarkRead && (
          <button
            type="button"
            title="Mark as read"
            onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              color: "#6b7280",
              display: "flex",
            }}
          >
            <Icon name="check" size={14} />
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            title="Dismiss"
            onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              color: "#9ca3af",
              display: "flex",
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
