"use client";

import { useState, useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Icon, Button, Badge, Modal } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";

import {
  useEmail,
  useToggleStar,
  useMarkEmailRead,
} from "../hooks/useEmail";

import { EmailComposer } from "./EmailComposer";

import type { EmailStatus, EmailPriority } from "../types/email.types";

// ── Props ─────────────────────────────────────────────────

interface EmailDetailProps {
  emailId: string;
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

const PRIORITY_BADGE_MAP: Record<EmailPriority, { label: string; variant: "danger" | "warning" | "secondary" | "outline" }> = {
  URGENT: { label: "Urgent", variant: "danger" },
  HIGH: { label: "High", variant: "warning" },
  NORMAL: { label: "Normal", variant: "secondary" },
  LOW: { label: "Low", variant: "outline" },
};

// ── Helpers ───────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────

export function EmailDetail({ emailId }: EmailDetailProps) {
  const router = useRouter();
  const { data: emailData, isLoading } = useEmail(emailId);
  const toggleStarMutation = useToggleStar();
  const markReadMutation = useMarkEmailRead();

  const [replyMode, setReplyMode] = useState<"REPLY" | "REPLY_ALL" | "FORWARD" | null>(null);

  const email = useMemo(() => emailData?.data, [emailData]);

  // ── Mark as read on load ──
  useMemo(() => {
    if (email && !email.isRead) {
      markReadMutation.mutate(emailId);
    }
  }, [email?.id]);

  // ── Handlers ──
  const handleToggleStar = useCallback(() => {
    toggleStarMutation.mutate(emailId);
  }, [toggleStarMutation, emailId]);

  const handleBack = useCallback(() => {
    router.push("/email");
  }, [router]);

  const handleReplyClose = useCallback(() => {
    setReplyMode(null);
  }, []);

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!email) {
    return (
      <div style={{ padding: 24 }}>
        <EmptyState
          icon="mail"
          title="Email not found"
          description="The email you are looking for does not exist or has been deleted."
          action={{ label: "Back to Inbox", onClick: handleBack }}
        />
      </div>
    );
  }

  const statusBadge = STATUS_BADGE_MAP[email.status] ?? { label: email.status, variant: "secondary" as const };
  const priorityBadge = email.priority ? PRIORITY_BADGE_MAP[email.priority] : null;

  return (
    <div style={{ padding: 24 }}>
      {/* Top navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Button variant="ghost" onClick={handleBack}>
          <Icon name="arrow-left" size={16} />
        </Button>
        <span style={{ fontSize: 13, color: "#6b7280" }}>Back to Inbox</span>
      </div>

      {/* Email Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header: Subject + badges */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
              {email.subject || "(No subject)"}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              {priorityBadge && (
                <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
              )}
              {email.direction === "INBOUND" && <Badge variant="outline">Inbound</Badge>}
              {email.direction === "OUTBOUND" && <Badge variant="primary">Outbound</Badge>}
            </div>
          </div>

          {/* Star toggle */}
          <div onClick={handleToggleStar} style={{ cursor: "pointer", padding: 4 }}>
            <Icon
              name="star"
              size={22}
              color={email.isStarred ? "#f59e0b" : "#d1d5db"}
              fill={email.isStarred ? "#f59e0b" : "none"}
            />
          </div>
        </div>

        {/* Meta information */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr",
            gap: "8px 12px",
            fontSize: 14,
            color: "#4b5563",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <span style={{ fontWeight: 500, color: "#6b7280" }}>From</span>
          <span>{email.fromName ? `${email.fromName} <${email.from}>` : email.from}</span>

          <span style={{ fontWeight: 500, color: "#6b7280" }}>To</span>
          <span>{email.to?.join(", ") ?? "---"}</span>

          {email.cc && email.cc.length > 0 && (
            <>
              <span style={{ fontWeight: 500, color: "#6b7280" }}>CC</span>
              <span>{email.cc.join(", ")}</span>
            </>
          )}

          <span style={{ fontWeight: 500, color: "#6b7280" }}>Date</span>
          <span>
            {new Date(email.sentAt ?? email.createdAt).toLocaleString()}
          </span>

          {email.openCount > 0 && (
            <>
              <span style={{ fontWeight: 500, color: "#6b7280" }}>Opens</span>
              <span>
                {email.openCount}
                {email.firstOpenedAt && (
                  <span style={{ color: "#9ca3af", marginLeft: 8, fontSize: 12 }}>
                    First: {new Date(email.firstOpenedAt).toLocaleString()}
                  </span>
                )}
              </span>
            </>
          )}

          {email.clickCount > 0 && (
            <>
              <span style={{ fontWeight: 500, color: "#6b7280" }}>Clicks</span>
              <span>{email.clickCount}</span>
            </>
          )}
        </div>

        {/* Body */}
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#1e293b",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          {/* NOTE: In production, sanitize HTML with DOMPurify before rendering */}
          <div dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
        </div>

        {/* Attachments */}
        {email.attachments?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Attachments ({email.attachments.length})
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {email.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url ?? att.filePath ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#4b5563",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                >
                  <Icon name="paperclip" size={14} color="#6b7280" />
                  <span>{att.fileName}</span>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>
                    ({formatFileSize(att.fileSize)})
                  </span>
                  <Icon name="download" size={14} color="#6366f1" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingTop: 16,
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <Button variant="outline" onClick={() => setReplyMode("REPLY")}>
            <Icon name="reply" size={16} />
            Reply
          </Button>
          <Button variant="outline" onClick={() => setReplyMode("REPLY_ALL")}>
            <Icon name="reply-all" size={16} />
            Reply All
          </Button>
          <Button variant="outline" onClick={() => setReplyMode("FORWARD")}>
            <Icon name="forward" size={16} />
            Forward
          </Button>
          <div style={{ flex: 1 }} />
          <Button variant="ghost" onClick={handleToggleStar}>
            <Icon
              name="star"
              size={16}
              color={email.isStarred ? "#f59e0b" : "#6b7280"}
              fill={email.isStarred ? "#f59e0b" : "none"}
            />
            {email.isStarred ? "Unstar" : "Star"}
          </Button>
        </div>
      </div>

      {/* Reply/Forward Modal */}
      {replyMode && (
        <Modal
          visible={!!replyMode}
          onClose={handleReplyClose}
          title={replyMode === "FORWARD" ? "Forward Email" : "Reply"}
          size="lg"
        >
          <EmailComposer
            mode="modal"
            replyTo={{
              emailId: email.id,
              type: replyMode,
            }}
            onSuccess={handleReplyClose}
            onCancel={handleReplyClose}
          />
        </Modal>
      )}
    </div>
  );
}
