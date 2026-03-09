"use client";

import { useState, useMemo, useCallback } from "react";

import { Button, Icon, SelectInput, Badge } from "@/components/ui";
import { UserSelect } from "@/components/common/UserSelect";

import {
  useFollowUps,
  useFollowUpStats,
  useCompleteFollowUp,
  useDeleteFollowUp,
} from "../hooks/useFollowUps";
import type { FollowUpStatus, FollowUpPriority, FollowUpFilters } from "../types/follow-ups.types";

import { FollowUpCard } from "./FollowUpCard";
import { FollowUpForm } from "./FollowUpForm";
import { SnoozeModal } from "./SnoozeModal";

// ── Tab definition ──────────────────────────────────────

type TabKey = "ALL" | "TODAY" | "OVERDUE" | "UPCOMING" | "COMPLETED";

const TABS: { key: TabKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TODAY", label: "Today" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "COMPLETED", label: "Completed" },
];

// ── Component ───────────────────────────────────────────

export function FollowUpList() {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snoozeId, setSnoozeId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Build filters from tab + filters
  const filters: FollowUpFilters = useMemo(() => {
    const f: FollowUpFilters = { page, limit: 20 };
    if (activeTab === "COMPLETED") f.status = "COMPLETED";
    else if (activeTab === "OVERDUE") f.isOverdue = true;
    else if (activeTab === "TODAY") {
      f.status = "PENDING";
    }
    else if (activeTab === "UPCOMING") f.status = "PENDING";
    if (priorityFilter) f.priority = priorityFilter as FollowUpPriority;
    if (userFilter) f.assignedToId = userFilter;
    return f;
  }, [activeTab, priorityFilter, userFilter, page]);

  const { data, isLoading } = useFollowUps(filters);
  const { data: statsData } = useFollowUpStats();
  const completeMutation = useCompleteFollowUp();
  const deleteMutation = useDeleteFollowUp();

  const followUps = useMemo(() => {
    const raw = data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const stats = useMemo(() => {
    return statsData?.data ?? { total: 0, overdue: 0, today: 0, upcoming: 0, completed: 0 };
  }, [statsData]);

  const handleComplete = useCallback(
    (id: string) => {
      completeMutation.mutate({ id });
    },
    [completeMutation],
  );

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setShowForm(true);
  }, []);

  const priorityOptions = [
    { label: "All Priorities", value: "" },
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
    { label: "Urgent", value: "URGENT" },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Follow-ups</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Icon name="plus" size={16} />
          <span style={{ marginLeft: 4 }}>Add Follow-up</span>
        </Button>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Total", value: stats.total, color: "#6b7280" },
          { label: "Overdue", value: stats.overdue, color: "#ef4444" },
          { label: "Today", value: stats.today, color: "#eab308" },
          { label: "Upcoming", value: stats.upcoming, color: "#3b82f6" },
          { label: "Completed", value: stats.completed, color: "#22c55e" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "12px 20px",
              border: "1px solid #e5e7eb",
              flex: "1 1 120px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 16,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 0,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? "#4f46e5" : "#6b7280",
              borderBottom: activeTab === tab.key ? "2px solid #4f46e5" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-end" }}>
        <div style={{ width: 200 }}>
          <SelectInput
            label="Priority"
            options={priorityOptions}
            value={priorityFilter}
            onChange={(val: string | number | boolean | null) =>
              setPriorityFilter(String(val ?? ""))
            }
            leftIcon={<Icon name="alert-triangle" size={16} />}
          />
        </div>
        <div style={{ width: 220 }}>
          <UserSelect
            label="Assigned To"
            value={userFilter}
            onChange={(val: string | number | boolean | null) =>
              setUserFilter(val ? String(val) : null)
            }
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ marginBottom: 20 }}>
          <FollowUpForm
            followUpId={editingId ?? undefined}
            onSuccess={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
          Loading follow-ups...
        </div>
      ) : followUps.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "#9ca3af",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
        >
          <Icon name="check-circle" size={40} />
          <p style={{ marginTop: 12, fontSize: 14 }}>No follow-ups found.</p>
        </div>
      ) : (
        <div>
          {followUps.map((fu) => (
            <FollowUpCard
              key={fu.id}
              followUp={fu}
              onComplete={handleComplete}
              onSnooze={(id) => setSnoozeId(id)}
              onReassign={() => {}}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {followUps.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
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
          <span
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            Page {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={followUps.length < 20}
          >
            Next
          </Button>
        </div>
      )}

      {/* Snooze modal */}
      {snoozeId && (
        <SnoozeModal
          open={!!snoozeId}
          onClose={() => setSnoozeId(null)}
          followUpId={snoozeId}
        />
      )}
    </div>
  );
}
