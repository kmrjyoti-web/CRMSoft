"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Modal, Button, Icon, Badge, TextareaInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useApprovalRequest,
  useApproveRequest,
  useRejectRequest,
} from "../hooks/useApprovals";
import { ApprovalBadge } from "./ApprovalBadge";

import type { ApprovalRequest } from "../types/approval.types";
import { formatDate } from "@/lib/format-date";

// ── Helpers ─────────────────────────────────────────────


function getExpiryText(expiresAt?: string): { text: string; isExpired: boolean } {
  if (!expiresAt) return { text: "--", isExpired: false };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { text: "Expired", isExpired: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { text: `Expires in ${hours}h ${minutes}m`, isExpired: false };
}

function makerName(req: ApprovalRequest): string {
  if (req.maker) return `${req.maker.firstName} ${req.maker.lastName}`;
  return req.makerId;
}

function checkerName(req: ApprovalRequest): string {
  if (req.checker) return `${req.checker.firstName} ${req.checker.lastName}`;
  return req.checkerId ?? "--";
}

// ── Props ───────────────────────────────────────────────

interface ApprovalDetailProps {
  approvalId: string;
  onClose?: () => void;
}

// ── Component ───────────────────────────────────────────

export function ApprovalDetail({ approvalId, onClose }: ApprovalDetailProps) {
  const { data, isLoading } = useApprovalRequest(approvalId);
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");

  const request: ApprovalRequest | null = (() => {
    const raw = data?.data;
    if (!raw) return null;
    return (raw as any)?.id ? (raw as ApprovalRequest) : ((raw as any)?.data ?? null);
  })();

  const isPending = request?.status === "PENDING";
  const expiry = getExpiryText(request?.expiresAt);

  const handleApprove = async () => {
    if (!request) return;
    try {
      await approveMutation.mutateAsync({
        id: request.id,
        dto: note.trim() ? { note: note.trim() } : undefined,
      });
      toast.success("Approved successfully");
      onClose?.();
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!request) return;
    if (!note.trim()) {
      setNoteError("Note is required for rejection");
      return;
    }
    setNoteError("");
    try {
      await rejectMutation.mutateAsync({
        id: request.id,
        dto: { note: note.trim() },
      });
      toast.success("Rejected successfully");
      onClose?.();
    } catch {
      toast.error("Failed to reject request");
    }
  };

  return (
    <Modal
      open={!!approvalId}
      onClose={onClose ?? (() => {})}
      title="Approval Request Detail"
      size="lg"
      footer={
        isPending ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={rejectMutation.isPending}
              disabled={approveMutation.isPending}
            >
              <Icon name="x-circle" size={16} /> Reject
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={approveMutation.isPending}
              disabled={rejectMutation.isPending}
            >
              <Icon name="check-circle" size={16} /> Approve
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )
      }
    >
      {isLoading || !request ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <LoadingSpinner />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 16,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Badge variant="primary">{request.entityType}</Badge>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                {request.action}
              </span>
            </div>
            <ApprovalBadge status={request.status} />
          </div>

          {/* ── Details Grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <DetailRow label="Maker" value={makerName(request)} />
            <DetailRow label="Maker Email" value={request.maker?.email ?? "--"} />
            <DetailRow label="Checker Role" value={request.checkerRole} />
            <DetailRow
              label="Checker"
              value={request.status !== "PENDING" ? checkerName(request) : "Awaiting..."}
            />
            <DetailRow label="Created" value={formatDate(request.createdAt)} />
            <DetailRow
              label="Expiry"
              value={expiry.text}
              valueStyle={expiry.isExpired ? { color: "#ef4444", fontWeight: 600 } : undefined}
            />
            {request.decidedAt && (
              <DetailRow label="Decided At" value={formatDate(request.decidedAt)} />
            )}
            {request.entityId && (
              <DetailRow label="Entity ID" value={request.entityId} />
            )}
          </div>

          {/* ── Maker Note ── */}
          {request.makerNote && (
            <div
              style={{
                background: "#f9fafb",
                borderRadius: 8,
                padding: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
                Maker Note
              </p>
              <p style={{ fontSize: 14, color: "#374151" }}>{request.makerNote}</p>
            </div>
          )}

          {/* ── Checker Note ── */}
          {request.checkerNote && (
            <div
              style={{
                background: request.status === "APPROVED" ? "#f0fdf4" : "#fef2f2",
                borderRadius: 8,
                padding: 12,
                border: `1px solid ${request.status === "APPROVED" ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>
                Checker Note
              </p>
              <p style={{ fontSize: 14, color: "#374151" }}>{request.checkerNote}</p>
            </div>
          )}

          {/* ── Timeline ── */}
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: 16,
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 12,
              }}
            >
              Timeline
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TimelineStep
                icon="plus-circle"
                label="Request Created"
                date={formatDate(request.createdAt)}
                description={`${makerName(request)} submitted ${request.action} for ${request.entityType}`}
                active
              />
              {request.decidedAt ? (
                <TimelineStep
                  icon={request.status === "APPROVED" ? "check-circle" : "x-circle"}
                  label={request.status === "APPROVED" ? "Approved" : "Rejected"}
                  date={formatDate(request.decidedAt)}
                  description={`${checkerName(request)} ${request.status.toLowerCase()} this request`}
                  active
                  color={request.status === "APPROVED" ? "#22c55e" : "#ef4444"}
                />
              ) : (
                <TimelineStep
                  icon="clock"
                  label="Awaiting Decision"
                  date={expiry.text}
                  description={`Pending review by ${request.checkerRole}`}
                  active={false}
                />
              )}
            </div>
          </div>

          {/* ── Payload ── */}
          {request.payload && Object.keys(request.payload).length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Payload
              </p>
              <pre
                style={{
                  background: "#1f2937",
                  color: "#d1fae5",
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 12,
                  overflow: "auto",
                  maxHeight: 240,
                }}
              >
                {JSON.stringify(request.payload, null, 2)}
              </pre>
            </div>
          )}

          {/* ── Decision Note Input (only for pending) ── */}
          {isPending && (
            <div>
              <TextareaInput
                label="Note (required for rejection)"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (noteError) setNoteError("");
                }}
                rows={3}
              />
              {noteError && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{noteError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

// ── Sub-Components ──────────────────────────────────────

function DetailRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div>
      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", ...valueStyle }}>{value}</p>
    </div>
  );
}

function TimelineStep({
  icon,
  label,
  date,
  description,
  active,
  color,
}: {
  icon: string;
  label: string;
  date: string;
  description: string;
  active: boolean;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, opacity: active ? 1 : 0.5 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: color ?? (active ? "#3b82f6" : "#d1d5db"),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon as any} size={14} style={{ color: "#fff" }} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{date}</span>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{description}</p>
      </div>
    </div>
  );
}
