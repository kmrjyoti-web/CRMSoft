"use client";

import { useState, useMemo } from "react";

import toast from "react-hot-toast";

import { Button, Card, Badge, Icon, SelectInput, Modal, Input } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useReminders,
  useReminderStats,
  useDismissReminder,
  useSnoozeReminder,
  useAcknowledgeReminder,
  useCancelReminder,
} from "../hooks/useReminders";
import type {
  Reminder,
  ReminderStats,
  ReminderStatus,
  ReminderPriority,
} from "../types/reminders.types";

// ---------------------------------------------------------------------------
// Badge variants
// ---------------------------------------------------------------------------

const PRIORITY_VARIANT: Record<string, "default" | "primary" | "warning" | "danger"> = {
  LOW: "default",
  MEDIUM: "primary",
  HIGH: "warning",
  URGENT: "danger",
};

const STATUS_VARIANT: Record<string, "default" | "primary" | "success" | "warning" | "secondary"> = {
  PENDING: "warning",
  SNOOZED: "primary",
  DISMISSED: "secondary",
  CANCELLED: "default",
  ACKNOWLEDGED: "success",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReminderListProps {
  onCreate?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReminderList({ onCreate }: ReminderListProps) {
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ReminderPriority | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [snoozeId, setSnoozeId] = useState<string | null>(null);
  const [snoozeMins, setSnoozeMins] = useState("30");

  const { data: statsData } = useReminderStats();
  const { data, isLoading } = useReminders({
    status: (statusFilter as ReminderStatus) || undefined,
    priority: (priorityFilter as ReminderPriority) || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const dismissMut = useDismissReminder();
  const snoozeMut = useSnoozeReminder();
  const ackMut = useAcknowledgeReminder();
  const cancelMut = useCancelReminder();

  const stats: ReminderStats | null = useMemo(() => {
    const raw = statsData?.data ?? statsData ?? null;
    return raw as ReminderStats | null;
  }, [statsData]);

  const reminders: Reminder[] = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // ── Actions ─────────────────────────────────────────────
  function handleDismiss(r: Reminder) {
    dismissMut.mutate(r.id, {
      onSuccess: () => toast.success("Reminder dismissed"),
      onError: () => toast.error("Failed to dismiss"),
    });
  }

  function handleAcknowledge(r: Reminder) {
    ackMut.mutate(r.id, {
      onSuccess: () => toast.success("Reminder acknowledged"),
      onError: () => toast.error("Failed to acknowledge"),
    });
  }

  function handleCancel(r: Reminder) {
    cancelMut.mutate(r.id, {
      onSuccess: () => toast.success("Reminder cancelled"),
      onError: () => toast.error("Failed to cancel"),
    });
  }

  function handleSnooze() {
    if (!snoozeId) return;
    const mins = parseInt(snoozeMins, 10);
    if (isNaN(mins) || mins <= 0) {
      toast.error("Enter a valid snooze duration");
      return;
    }
    snoozeMut.mutate(
      { id: snoozeId, dto: { snoozeDuration: mins } },
      {
        onSuccess: () => {
          toast.success(`Snoozed for ${mins} minutes`);
          setSnoozeId(null);
        },
        onError: () => toast.error("Failed to snooze"),
      }
    );
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Reminders</h2>
        <Button variant="primary" onClick={onCreate}>
          <Icon name="plus" size={16} /> Create Reminder
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Pending", value: stats.pending, color: "#f59e0b", icon: "clock" },
            { label: "Snoozed", value: stats.snoozed, color: "#6366f1", icon: "pause" },
            { label: "Overdue", value: stats.overdueCount, color: "#ef4444", icon: "alert-triangle" },
            { label: "Today", value: stats.todayCount, color: "#059669", icon: "calendar" },
          ].map((stat) => (
            <Card key={stat.label}>
              <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: stat.color }}>
                  <Icon name={stat.icon} size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{stat.label}</p>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ width: "180px" }}>
          <SelectInput
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter((v as ReminderStatus) || "")}
            options={[
              { label: "All Statuses", value: "" },
              { label: "Pending", value: "PENDING" },
              { label: "Snoozed", value: "SNOOZED" },
              { label: "Dismissed", value: "DISMISSED" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Acknowledged", value: "ACKNOWLEDGED" },
            ]}
          />
        </div>
        <div style={{ width: "180px" }}>
          <SelectInput
            label="Priority"
            value={priorityFilter}
            onChange={(v) => setPriorityFilter((v as ReminderPriority) || "")}
            options={[
              { label: "All Priorities", value: "" },
              { label: "Low", value: "LOW" },
              { label: "Medium", value: "MEDIUM" },
              { label: "High", value: "HIGH" },
              { label: "Urgent", value: "URGENT" },
            ]}
          />
        </div>
        <div style={{ width: "160px" }}>
          <Input
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(v: string) => setFromDate(v)}
          />
        </div>
        <div style={{ width: "160px" }}>
          <Input
            label="To Date"
            type="date"
            value={toDate}
            onChange={(v: string) => setToDate(v)}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <LoadingSpinner />
        </div>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Title</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Entity</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Remind At</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                      No reminders found
                    </td>
                  </tr>
                )}
                {reminders.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>{r.title}</td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                      {r.entityName || r.entityType || "\u2014"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                      {new Date(r.remindAt).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={PRIORITY_VARIANT[r.priority] ?? "default"}>
                        {r.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {r.status === "PENDING" && (
                          <>
                            <Button variant="ghost" onClick={() => handleDismiss(r)} disabled={dismissMut.isPending}>
                              <Icon name="x-circle" size={14} />
                            </Button>
                            <Button variant="ghost" onClick={() => { setSnoozeId(r.id); setSnoozeMins("30"); }}>
                              <Icon name="clock" size={14} />
                            </Button>
                            <Button variant="ghost" onClick={() => handleAcknowledge(r)} disabled={ackMut.isPending}>
                              <Icon name="check" size={14} />
                            </Button>
                            <Button variant="ghost" onClick={() => handleCancel(r)} disabled={cancelMut.isPending}>
                              <Icon name="x-circle" size={14} />
                            </Button>
                          </>
                        )}
                        {r.status === "SNOOZED" && (
                          <>
                            <Button variant="ghost" onClick={() => handleDismiss(r)} disabled={dismissMut.isPending}>
                              <Icon name="x-circle" size={14} />
                            </Button>
                            <Button variant="ghost" onClick={() => handleAcknowledge(r)} disabled={ackMut.isPending}>
                              <Icon name="check" size={14} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Snooze Modal */}
      <Modal
        open={!!snoozeId}
        onClose={() => setSnoozeId(null)}
        title="Snooze Reminder"
      >
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Snooze duration (minutes)"
            leftIcon={<Icon name="clock" size={16} />}
            type="number"
            value={snoozeMins}
            onChange={(v: string) => setSnoozeMins(v)}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[15, 30, 60, 120, 1440].map((mins) => (
              <Button
                key={mins}
                variant={snoozeMins === String(mins) ? "primary" : "outline"}
                onClick={() => setSnoozeMins(String(mins))}
              >
                {mins < 60 ? `${mins}m` : mins < 1440 ? `${mins / 60}h` : "1 day"}
              </Button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setSnoozeId(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSnooze} disabled={snoozeMut.isPending}>
              {snoozeMut.isPending ? <LoadingSpinner /> : "Snooze"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
