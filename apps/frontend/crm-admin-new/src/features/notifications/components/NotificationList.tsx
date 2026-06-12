"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icon, Button, SelectInput } from "@/components/ui";
import { LoadingSpinner, PageHeader } from "@/components/common";
import {
  useNotificationsList,
  useNotificationStats,
  useMarkRead,
  useMarkAllRead,
  useDismissNotification,
  useBulkMarkRead,
  useBulkDismiss,
} from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import type {
  Notification,
  NotificationCategory,
  NotificationStatus,
  NotificationPriority,
} from "../types/notifications.types";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Lead Assigned", value: "LEAD_ASSIGNED" },
  { label: "Lead Updated", value: "LEAD_UPDATED" },
  { label: "Follow-up Due", value: "FOLLOW_UP_DUE" },
  { label: "Follow-up Overdue", value: "FOLLOW_UP_OVERDUE" },
  { label: "Demo Scheduled", value: "DEMO_SCHEDULED" },
  { label: "Demo Completed", value: "DEMO_COMPLETED" },
  { label: "Quotation Sent", value: "QUOTATION_SENT" },
  { label: "Quotation Approved", value: "QUOTATION_APPROVED" },
  { label: "Activity Reminder", value: "ACTIVITY_REMINDER" },
  { label: "System Alert", value: "SYSTEM_ALERT" },
  { label: "Workflow Action", value: "WORKFLOW_ACTION" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Unread", value: "UNREAD" },
  { label: "Read", value: "READ" },
  { label: "Dismissed", value: "DISMISSED" },
];

const PRIORITY_OPTIONS = [
  { label: "All Priority", value: "" },
  { label: "Urgent", value: "URGENT" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
];

export function NotificationList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const params = {
    page,
    limit: 20,
    ...(category ? { category: category as NotificationCategory } : {}),
    ...(status ? { status: status as NotificationStatus } : {}),
    ...(priority ? { priority: priority as NotificationPriority } : {}),
  };

  const { data: res, isLoading } = useNotificationsList(params);
  const { data: statsRes } = useNotificationStats();

  const notifications: Notification[] = Array.isArray(res?.data) ? res.data : [];
  const stats = statsRes?.data;

  const markReadMut = useMarkRead();
  const markAllReadMut = useMarkAllRead();
  const dismissMut = useDismissNotification();
  const bulkMarkReadMut = useBulkMarkRead();
  const bulkDismissMut = useBulkDismiss();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === notifications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notifications.map((n) => n.id)));
    }
  };

  const handleBulkRead = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    bulkMarkReadMut.mutate(ids, {
      onSuccess: () => { toast.success("Marked as read"); setSelected(new Set()); },
    });
  };

  const handleBulkDismiss = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    bulkDismissMut.mutate(ids, {
      onSuccess: () => { toast.success("Dismissed"); setSelected(new Set()); },
    });
  };

  const handleClick = (notif: Notification) => {
    if (notif.status === "UNREAD") markReadMut.mutate(notif.id);
    if (notif.actionUrl) router.push(notif.actionUrl);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your CRM activity"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="outline"
              onClick={() => router.push("/notifications/preferences")}
            >
              <Icon name="settings" size={16} />
              Preferences
            </Button>
            <Button
              variant="outline"
              onClick={() => markAllReadMut.mutate(undefined, {
                onSuccess: () => toast.success("All marked as read"),
              })}
              disabled={!stats || stats.unread === 0}
            >
              <Icon name="check" size={16} />
              Mark all read
            </Button>
          </div>
        }
      />

      {/* Stats Bar */}
      {stats && (
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 20,
            padding: "12px 16px",
            background: "#f9fafb",
            borderRadius: 10,
          }}
        >
          {[
            { label: "Total", value: stats.total, color: "#374151" },
            { label: "Unread", value: stats.unread, color: "#3b82f6" },
            { label: "Read", value: stats.read, color: "#10b981" },
            { label: "Dismissed", value: stats.dismissed, color: "#9ca3af" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{s.label}:</span>
              <strong style={{ fontSize: 14, color: s.color }}>{s.value}</strong>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div style={{ width: 200 }}>
          <SelectInput
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(v) => { setCategory(String(v ?? "")); setPage(1); }}
            leftIcon={<Icon name="filter" size={16} />}
          />
        </div>
        <div style={{ width: 160 }}>
          <SelectInput
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => { setStatus(String(v ?? "")); setPage(1); }}
          />
        </div>
        <div style={{ width: 160 }}>
          <SelectInput
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(v) => { setPriority(String(v ?? "")); setPage(1); }}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
            padding: "8px 16px",
            background: "#eff6ff",
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 13, color: "#1d4ed8" }}>
            {selected.size} selected
          </span>
          <Button variant="outline" size="sm" onClick={handleBulkRead}>
            Mark Read
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkDismiss}>
            Dismiss
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <Icon name="bell" size={48} />
          <p style={{ fontSize: 15, marginTop: 12 }}>No notifications found</p>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Select All Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 16px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            <input
              type="checkbox"
              checked={selected.size === notifications.length && notifications.length > 0}
              onChange={toggleSelectAll}
              style={{ cursor: "pointer" }}
            />
            <span>Select all</span>
          </div>

          {notifications.map((n) => (
            <div
              key={n.id}
              style={{ display: "flex", alignItems: "flex-start" }}
            >
              <div style={{ padding: "14px 0 14px 16px" }}>
                <input
                  type="checkbox"
                  checked={selected.has(n.id)}
                  onChange={() => toggleSelect(n.id)}
                  style={{ cursor: "pointer", marginTop: 2 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <NotificationItem
                  notification={n}
                  onClick={handleClick}
                  onMarkRead={(id) => markReadMut.mutate(id)}
                  onDismiss={(id) => dismissMut.mutate(id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {notifications.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 20,
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={notifications.length < 20}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
