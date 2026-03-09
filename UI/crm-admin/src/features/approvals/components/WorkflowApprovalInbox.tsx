"use client";

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

import { Modal, Button, Icon, Badge } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  usePendingWorkflowApprovals,
  useWorkflowApprovalHistory,
  useApproveWorkflow,
  useRejectWorkflow,
} from "../hooks/useApprovals";
import { ApprovalBadge } from "./ApprovalBadge";

import type { WorkflowApproval } from "../types/approval.types";

// ── Constants ───────────────────────────────────────────

const PAGE_SIZE = 10;

// ── Styles ──────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #e5e7eb",
};

// ── Helpers ─────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getExpiryInfo(expiresAt?: string): { text: string; isExpired: boolean } {
  if (!expiresAt) return { text: "--", isExpired: false };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { text: "Expired", isExpired: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return { text: `Expires in ${days}d`, isExpired: false };
  }
  return { text: `Expires in ${hours}h ${minutes}m`, isExpired: false };
}

function getRequesterName(item: WorkflowApproval): string {
  if (item.requestedBy) return `${item.requestedBy.firstName} ${item.requestedBy.lastName}`;
  return item.requestedById;
}

// ── Component ───────────────────────────────────────────

export function WorkflowApprovalInbox() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [page, setPage] = useState(1);

  // ── Comment modal state ──
  const [commentModal, setCommentModal] = useState<{
    open: boolean;
    type: "approve" | "reject";
    itemId: string;
  }>({ open: false, type: "approve", itemId: "" });
  const [comment, setComment] = useState("");

  const pendingQuery = usePendingWorkflowApprovals(
    activeTab === "pending" ? { page, limit: PAGE_SIZE } : undefined,
  );
  const historyQuery = useWorkflowApprovalHistory(
    activeTab === "history" ? { page, limit: PAGE_SIZE } : undefined,
  );
  const approveMutation = useApproveWorkflow();
  const rejectMutation = useRejectWorkflow();

  const currentQuery = activeTab === "pending" ? pendingQuery : historyQuery;

  const items: WorkflowApproval[] = useMemo(() => {
    const raw = currentQuery.data?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: WorkflowApproval[] };
    return nested?.data ?? [];
  }, [currentQuery.data]);

  const meta = useMemo(() => {
    const raw = currentQuery.data?.data;
    if (!raw || Array.isArray(raw)) return null;
    const nested = raw as unknown as { meta?: { total?: number; totalPages?: number } };
    return nested?.meta ?? null;
  }, [currentQuery.data]);

  const totalPages = meta?.totalPages ?? 1;

  const pendingCount = useMemo(() => {
    const raw = pendingQuery.data?.data;
    if (!raw) return 0;
    if (Array.isArray(raw)) return raw.length;
    const nested = raw as unknown as { meta?: { total?: number } };
    return nested?.meta?.total ?? 0;
  }, [pendingQuery.data]);

  const historyCount = useMemo(() => {
    const raw = historyQuery.data?.data;
    if (!raw) return 0;
    if (Array.isArray(raw)) return raw.length;
    const nested = raw as unknown as { meta?: { total?: number } };
    return nested?.meta?.total ?? 0;
  }, [historyQuery.data]);

  const handleTabChange = useCallback(
    (tab: "pending" | "history") => {
      setActiveTab(tab);
      setPage(1);
    },
    [],
  );

  const openCommentModal = (type: "approve" | "reject", itemId: string) => {
    setCommentModal({ open: true, type, itemId });
    setComment("");
  };

  const closeCommentModal = () => {
    setCommentModal({ open: false, type: "approve", itemId: "" });
    setComment("");
  };

  const handleConfirmAction = async () => {
    const { type, itemId } = commentModal;
    try {
      if (type === "approve") {
        await approveMutation.mutateAsync({
          id: itemId,
          comment: comment.trim() || undefined,
        });
        toast.success("Workflow approved");
      } else {
        await rejectMutation.mutateAsync({
          id: itemId,
          comment: comment.trim() || undefined,
        });
        toast.success("Workflow rejected");
      }
      closeCommentModal();
    } catch {
      toast.error(`Failed to ${type} workflow`);
    }
  };

  const isActionPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div style={{ padding: 24 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>
          Workflow Approvals
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
          Review workflow state transition approvals
        </p>
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "2px solid #e5e7eb",
          marginBottom: 20,
        }}
      >
        <TabButton
          label="Pending"
          count={pendingCount}
          active={activeTab === "pending"}
          onClick={() => handleTabChange("pending")}
        />
        <TabButton
          label="History"
          count={historyCount}
          active={activeTab === "history"}
          onClick={() => handleTabChange("history")}
        />
      </div>

      {/* ── Content ── */}
      <div style={cardStyle}>
        {currentQuery.isLoading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Icon name="inbox" size={40} style={{ color: "#d1d5db" }} />
            <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 12 }}>
              {activeTab === "pending"
                ? "No pending workflow approvals"
                : "No workflow approval history"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item) => {
              const expiry = getExpiryInfo(item.expiresAt);
              const fromState = item.transition?.fromState?.name ?? "--";
              const toState = item.transition?.toState?.name ?? "--";
              const currentStateName = item.instance?.currentState?.name ?? "--";
              const currentStateColor = item.instance?.currentState?.color ?? "#6b7280";

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid #f3f4f6",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "#f3f4f6";
                  }}
                >
                  {/* Left: Info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {/* Entity Badge */}
                    <Badge variant="primary">
                      {item.instance?.entityType ?? "Workflow"}
                    </Badge>

                    <div style={{ minWidth: 0 }}>
                      {/* Transition Arrow */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        <span style={{ color: "#6b7280" }}>{fromState}</span>
                        <Icon name="arrow-right" size={14} style={{ color: "#9ca3af" }} />
                        <span style={{ color: "#111827", fontWeight: 600 }}>{toState}</span>
                        <ApprovalBadge status={item.status} />
                      </div>

                      {/* Meta Row */}
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          marginTop: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Current State Dot */}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: currentStateColor,
                              display: "inline-block",
                            }}
                          />
                          {currentStateName}
                        </span>

                        <span>
                          <Icon name="user" size={11} /> {getRequesterName(item)}
                        </span>

                        {item.instance?.entityId && (
                          <span style={{ color: "#9ca3af" }}>
                            ID: {item.instance.entityId.slice(0, 8)}...
                          </span>
                        )}

                        {item.comment && (
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 180,
                            }}
                          >
                            &mdash; {item.comment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Meta + Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: 11,
                        color: "#9ca3af",
                      }}
                    >
                      <div>{formatDate(item.createdAt)}</div>
                      {item.expiresAt && (
                        <div
                          style={{
                            color: expiry.isExpired ? "#ef4444" : "#6b7280",
                            fontWeight: expiry.isExpired ? 600 : 400,
                          }}
                        >
                          {expiry.text}
                        </div>
                      )}
                    </div>

                    {activeTab === "pending" && item.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button
                          variant="primary"
                          onClick={() => openCommentModal("approve", item.id)}
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          <Icon name="check" size={12} /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => openCommentModal("reject", item.id)}
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          <Icon name="x" size={12} /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: "4px 12px", fontSize: 13 }}
            >
              <Icon name="chevron-left" size={14} /> Previous
            </Button>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: "4px 12px", fontSize: 13 }}
            >
              Next <Icon name="chevron-right" size={14} />
            </Button>
          </div>
        )}
      </div>

      {/* ── Comment Modal ── */}
      <Modal
        open={commentModal.open}
        onClose={closeCommentModal}
        title={commentModal.type === "approve" ? "Approve Workflow" : "Reject Workflow"}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="outline" onClick={closeCommentModal} disabled={isActionPending}>
              Cancel
            </Button>
            <Button
              variant={commentModal.type === "approve" ? "primary" : "danger"}
              onClick={handleConfirmAction}
              loading={isActionPending}
              disabled={isActionPending}
            >
              <Icon
                name={commentModal.type === "approve" ? "check-circle" : "x-circle"}
                size={16}
              />
              {commentModal.type === "approve" ? "Approve" : "Reject"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 14, color: "#374151" }}>
            {commentModal.type === "approve"
              ? "Add an optional comment for this approval:"
              : "Add a comment for this rejection:"}
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Enter your comment..."
            style={{
              width: "100%",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              padding: "8px 12px",
              fontSize: 14,
              resize: "vertical",
              outline: "none",
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

// ── Sub-Component: Tab Button ───────────────────────────

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        padding: "10px 20px",
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        color: active ? "#111827" : "#6b7280",
        background: "transparent",
        border: "none",
        borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: -2,
        transition: "all 0.15s",
      }}
    >
      {label}
      {count > 0 && (
        <span
          style={{
            background: active ? "#3b82f6" : "#e5e7eb",
            color: active ? "#fff" : "#6b7280",
            borderRadius: 10,
            padding: "1px 8px",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
