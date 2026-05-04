"use client";

import { useMemo } from "react";

import toast from "react-hot-toast";

import { Button, Card, Badge, Icon } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  usePendingReminders,
  useDismissReminder,
  useSnoozeReminder,
} from "../hooks/useReminders";
import type { Reminder, ReminderPriority } from "../types/reminders.types";

// ---------------------------------------------------------------------------
// Badge variants
// ---------------------------------------------------------------------------

const PRIORITY_VARIANT: Record<string, "default" | "primary" | "warning" | "danger"> = {
  LOW: "default",
  MEDIUM: "primary",
  HIGH: "warning",
  URGENT: "danger",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);

  if (absDiffMs < 60_000) return diffMs > 0 ? "in less than a minute" : "just now";

  const mins = Math.floor(absDiffMs / 60_000);
  if (mins < 60) return diffMs > 0 ? `in ${mins}m` : `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return diffMs > 0 ? `in ${hours}h` : `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return diffMs > 0 ? `in ${days}d` : `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReminderWidget() {
  const { data, isLoading } = usePendingReminders();
  const dismissMut = useDismissReminder();
  const snoozeMut = useSnoozeReminder();

  const reminders: Reminder[] = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.slice(0, 5);
  }, [data]);

  const totalPending = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw.length : 0;
  }, [data]);

  function handleDismiss(id: string) {
    dismissMut.mutate(id, {
      onSuccess: () => toast.success("Dismissed"),
      onError: () => toast.error("Failed to dismiss"),
    });
  }

  function handleQuickSnooze(id: string) {
    snoozeMut.mutate(
      { id, dto: { snoozeDuration: 30 } },
      {
        onSuccess: () => toast.success("Snoozed for 30 minutes"),
        onError: () => toast.error("Failed to snooze"),
      }
    );
  }

  if (isLoading) {
    return (
      <Card>
        <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ padding: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="bell" size={18} />
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Pending Reminders</h4>
          </div>
          <Badge variant={totalPending > 0 ? "warning" : "default"}>
            {totalPending}
          </Badge>
        </div>

        {/* List */}
        {reminders.length === 0 ? (
          <p style={{ margin: 0, textAlign: "center", color: "#9ca3af", fontSize: "13px", padding: "12px 0" }}>
            No pending reminders
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {reminders.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  backgroundColor: "#f9fafb",
                  fontSize: "13px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.title}
                    </span>
                    <Badge variant={PRIORITY_VARIANT[r.priority] ?? "default"}>
                      {r.priority}
                    </Badge>
                  </div>
                  <span style={{ color: "#6b7280", fontSize: "12px" }}>
                    {formatTimeAgo(r.remindAt)}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "4px", marginLeft: "8px", flexShrink: 0 }}>
                  <Button
                    variant="ghost"
                    onClick={() => handleQuickSnooze(r.id)}
                    disabled={snoozeMut.isPending}
                  >
                    <Icon name="clock" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDismiss(r.id)}
                    disabled={dismissMut.isPending}
                  >
                    <Icon name="x" size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All */}
        {totalPending > 5 && (
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <a
              href="/reminders"
              style={{ fontSize: "13px", color: "#3b82f6", textDecoration: "none" }}
            >
              View All ({totalPending})
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
