"use client";

import { useState, useMemo, useCallback } from "react";

import { Icon, Button, Badge } from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";

import { useEmailThread } from "../hooks/useEmail";

import { EmailComposer } from "./EmailComposer";

import type { Email, EmailStatus } from "../types/email.types";

// ── Props ─────────────────────────────────────────────────

interface EmailThreadViewProps {
  threadId: string;
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

// ── Thread Email Item ─────────────────────────────────────

interface ThreadEmailProps {
  email: Email;
  isExpanded: boolean;
  onToggle: () => void;
}

function ThreadEmail({ email, isExpanded, onToggle }: ThreadEmailProps) {
  const statusBadge = STATUS_BADGE_MAP[email.status] ?? { label: email.status, variant: "secondary" as const };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      {/* Collapsed header */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "#f9fafb";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "#fff";
        }}
      >
        <Icon
          name={isExpanded ? "chevron-down" : "chevron-right"}
          size={16}
          color="#6b7280"
        />
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#ede9fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="user" size={16} color="#7c3aed" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email.fromName ?? email.from}
            </span>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          {!isExpanded && (
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: 2,
              }}
            >
              {email.bodyText?.slice(0, 100) ?? ""}
            </p>
          )}
        </div>
        <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>
          {new Date(email.sentAt ?? email.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div
          style={{
            padding: "0 16px 16px 60px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          {/* Meta */}
          <div
            style={{
              fontSize: 13,
              color: "#6b7280",
              marginBottom: 12,
              marginTop: 12,
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: 500 }}>From: </span>
              {email.fromName ? `${email.fromName} <${email.from}>` : email.from}
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: 500 }}>To: </span>
              {email.to?.join(", ")}
            </div>
            {email.cc && email.cc.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>CC: </span>
                {email.cc.join(", ")}
              </div>
            )}
          </div>

          {/* Body */}
          <div
            style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b" }}
            dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
          />

          {/* Attachments */}
          {email.attachments?.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {email.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url ?? att.filePath ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#4b5563",
                    textDecoration: "none",
                  }}
                >
                  <Icon name="paperclip" size={12} color="#6b7280" />
                  {att.fileName}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────

export function EmailThreadView({ threadId }: EmailThreadViewProps) {
  const { data: threadData, isLoading } = useEmailThread(threadId);
  const thread = useMemo(() => threadData?.data, [threadData]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showReply, setShowReply] = useState(false);

  // Expand last email by default
  useMemo(() => {
    if (thread?.emails?.length) {
      const lastEmail = thread.emails[thread.emails.length - 1];
      setExpandedIds(new Set([lastEmail.id]));
    }
  }, [thread?.id]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const lastEmailId = thread?.emails?.[thread.emails.length - 1]?.id;

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!thread) {
    return (
      <div style={{ padding: 24 }}>
        <EmptyState
          icon="mail"
          title="Thread not found"
          description="The email thread you are looking for does not exist."
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Thread subject */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
          {thread.subject}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge variant="secondary">{thread.messageCount} messages</Badge>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {thread.participantEmails?.join(", ")}
          </span>
        </div>
      </div>

      {/* Emails in thread */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {thread.emails?.map((email) => (
          <ThreadEmail
            key={email.id}
            email={email}
            isExpanded={expandedIds.has(email.id)}
            onToggle={() => toggleExpanded(email.id)}
          />
        ))}
      </div>

      {/* Reply section */}
      <div style={{ marginTop: 16 }}>
        {showReply ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #e5e7eb",
            }}
          >
            <EmailComposer
              mode="modal"
              replyTo={
                lastEmailId
                  ? { emailId: lastEmailId, type: "REPLY" }
                  : undefined
              }
              onSuccess={() => setShowReply(false)}
              onCancel={() => setShowReply(false)}
            />
          </div>
        ) : (
          <Button variant="primary" onClick={() => setShowReply(true)}>
            <Icon name="reply" size={16} />
            Reply
          </Button>
        )}
      </div>
    </div>
  );
}
