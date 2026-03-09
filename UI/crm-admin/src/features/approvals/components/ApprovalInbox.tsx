"use client";

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

import { Button, Icon, Badge, SelectInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  usePendingApprovals,
  useMyRequests,
  useApproveRequest,
  useRejectRequest,
} from "../hooks/useApprovals";
import { ApprovalBadge } from "./ApprovalBadge";
import { ApprovalDetail } from "./ApprovalDetail";

import type { ApprovalRequest, ApprovalStatus, ApprovalFilters } from "../types/approval.types";

// ── Constants ───────────────────────────────────────────

const ENTITY_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Raw Contact", value: "RAW_CONTACT" },
  { label: "Contact", value: "CONTACT" },
  { label: "Organization", value: "ORGANIZATION" },
  { label: "Lead", value: "LEAD" },
  { label: "Quotation", value: "QUOTATION" },
  { label: "Ticket", value: "TICKET" },
  { label: "Product", value: "PRODUCT" },
];

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

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

function getExpiryInfo(expiresAt: string): { text: string; isExpired: boolean } {
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

function getMakerName(req: ApprovalRequest): string {
  if (req.maker) return `${req.maker.firstName} ${req.maker.lastName}`;
  return req.makerId;
}

// ── Component ───────────────────────────────────────────

export function ApprovalInbox() {
  const [activeTab, setActiveTab] = useState<"pending" | "my-requests">("pending");
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filters: ApprovalFilters = useMemo(() => {
    const f: ApprovalFilters = { page, limit: PAGE_SIZE };
    if (entityFilter) f.entityType = entityFilter;
    if (statusFilter) f.status = statusFilter as ApprovalStatus;
    return f;
  }, [entityFilter, statusFilter, page]);

  const pendingQuery = usePendingApprovals(activeTab === "pending" ? filters : undefined);
  const myRequestsQuery = useMyRequests(activeTab === "my-requests" ? filters : undefined);
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const currentQuery = activeTab === "pending" ? pendingQuery : myRequestsQuery;

  const items: ApprovalRequest[] = useMemo(() => {
    const raw = currentQuery.data?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    const nested = raw as unknown as { data?: ApprovalRequest[] };
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

  const myRequestsCount = useMemo(() => {
    const raw = myRequestsQuery.data?.data;
    if (!raw) return 0;
    if (Array.isArray(raw)) return raw.length;
    const nested = raw as unknown as { meta?: { total?: number } };
    return nested?.meta?.total ?? 0;
  }, [myRequestsQuery.data]);

  const handleTabChange = useCallback(
    (tab: "pending" | "my-requests") => {
      setActiveTab(tab);
      setPage(1);
    },
    [],
  );

  const handleQuickApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("Approved");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleQuickReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id, dto: { note: "Quick rejection" } });
      toast.success("Rejected");
    } catch {
      toast.error("Failed to reject");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>
          Approval Inbox
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
          Review and manage approval requests
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
          label="Pending for Me"
          count={pendingCount}
          active={activeTab === "pending"}
          onClick={() => handleTabChange("pending")}
        />
        <TabButton
          label="My Requests"
          count={myRequestsCount}
          active={activeTab === "my-requests"}
          onClick={() => handleTabChange("my-requests")}
        />
      </div>

      {/* ── Filters ── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 200 }}>
          <SelectInput
            label="Entity Type"
            options={ENTITY_OPTIONS}
            value={entityFilter}
            onChange={(v) => {
              setEntityFilter(String(v ?? ""));
              setPage(1);
            }}
            leftIcon={<Icon name="database" size={16} />}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <SelectInput
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(String(v ?? ""));
              setPage(1);
            }}
            leftIcon={<Icon name="filter" size={16} />}
          />
        </div>
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
                ? "No pending approvals for you"
                : "You have no approval requests"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((item) => {
              const expiry = getExpiryInfo(item.expiresAt);
              return (
                <div
                  key={item.id}
                  onClick={() => setDetailId(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid #f3f4f6",
                    cursor: "pointer",
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
                    <Badge variant="primary">{item.entityType}</Badge>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {item.action}
                        </span>
                        <ApprovalBadge status={item.status} />
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          marginTop: 2,
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          <Icon name="user" size={11} /> {getMakerName(item)}
                        </span>
                        {item.makerNote && (
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 200,
                            }}
                          >
                            &mdash; {item.makerNote}
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
                      <div
                        style={{
                          color: expiry.isExpired ? "#ef4444" : "#6b7280",
                          fontWeight: expiry.isExpired ? 600 : 400,
                        }}
                      >
                        {expiry.text}
                      </div>
                    </div>

                    {activeTab === "pending" && item.status === "PENDING" && (
                      <div
                        style={{ display: "flex", gap: 4 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="primary"
                          onClick={() => handleQuickApprove(item.id)}
                          loading={
                            approveMutation.isPending &&
                            (approveMutation.variables as any)?.id === item.id
                          }
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          <Icon name="check" size={12} /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleQuickReject(item.id)}
                          loading={
                            rejectMutation.isPending &&
                            (rejectMutation.variables as any)?.id === item.id
                          }
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

      {/* ── Detail Modal ── */}
      {detailId && (
        <ApprovalDetail
          approvalId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
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
