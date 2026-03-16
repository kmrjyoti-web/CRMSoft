"use client";

import { useState, useMemo, useCallback } from "react";

import { Button, Icon, SelectInput, Badge } from "@/components/ui";
import { UserSelect } from "@/components/common/UserSelect";
import { useEntityPanel } from "@/hooks/useEntityPanel";

import {
  useFollowUps,
  useFollowUpStats,
  useCompleteFollowUp,
  useDeleteFollowUp,
} from "../hooks/useFollowUps";
import type { FollowUpPriority, FollowUpFilters } from "../types/follow-ups.types";

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
  const [snoozeId, setSnoozeId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ── Shared drawer for create/edit ─────────────────────
  const { handleRowEdit, handleCreate } = useEntityPanel({
    entityKey: "follow-up",
    entityLabel: "Follow-up",
    FormComponent: FollowUpForm,
    idProp: "followUpId",
    editRoute: "/follow-ups/:id/edit",
    createRoute: "/follow-ups/new",
    displayField: "title",
  });

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
    const fu = followUps.find((f) => f.id === id);
    handleRowEdit({ id, title: fu?.title ?? "Follow-up" });
  }, [followUps, handleRowEdit]);

  const priorityOptions = [
    { label: "All Priorities", value: "" },
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
    { label: "Urgent", value: "URGENT" },
  ];

  const statItems = [
    { label: "Total", value: stats.total, color: "#6b7280" },
    { label: "Overdue", value: stats.overdue, color: "#ef4444" },
    { label: "Today", value: stats.today, color: "#eab308" },
    { label: "Upcoming", value: stats.upcoming, color: "#3b82f6" },
    { label: "Completed", value: stats.completed, color: "#22c55e" },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── Toolbar (matches TableFull header bar) ────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Follow-ups</h1>
          <div className="h-5 w-px bg-gray-300" />

          {/* Inline KPI stats */}
          <div className="flex items-center gap-4">
            {statItems.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="text-base font-bold" style={{ color: s.color }}>
                  {s.value}
                </span>
                <span className="text-xs text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs as pill buttons */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-gray-300" />

          {/* Filters */}
          <div className="w-36">
            <SelectInput
              label="Priority"
              options={priorityOptions}
              value={priorityFilter}
              onChange={(val: string | number | boolean | null) =>
                setPriorityFilter(String(val ?? ""))
              }
              leftIcon={<Icon name="alert-triangle" size={14} />}
            />
          </div>
          <div className="w-40">
            <UserSelect
              label="Assigned To"
              value={userFilter}
              onChange={(val: string | number | boolean | null) =>
                setUserFilter(val ? String(val) : null)
              }
            />
          </div>

          <div className="h-5 w-px bg-gray-300" />

          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
          >
            <Icon name="plus" size={14} />
            <span className="ml-1">Add Follow-up</span>
          </Button>
        </div>
      </header>

      {/* ── Content area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            Loading follow-ups...
          </div>
        ) : followUps.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-200">
            <Icon name="check-circle" size={40} />
            <p className="mt-3 text-sm">No follow-ups found.</p>
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
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">Page {page}</span>
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
      </div>

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
