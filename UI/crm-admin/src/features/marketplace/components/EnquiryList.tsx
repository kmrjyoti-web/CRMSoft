"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button, Badge, Icon, Modal } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useVendorEnquiries,
  useReplyEnquiry,
} from "../hooks/useMarketplace";
import type { MarketplaceEnquiry } from "../types/marketplace.types";

// ── Status helpers ────────────────────────────────────────────────────────────

type BadgeVariant = "primary" | "success" | "secondary";

function enquiryStatusVariant(
  status: MarketplaceEnquiry["status"],
): BadgeVariant {
  switch (status) {
    case "OPEN":
      return "primary";
    case "REPLIED":
      return "success";
    case "CLOSED":
      return "secondary";
    default:
      return "secondary";
  }
}

function truncate(text: string, maxLen = 80): string {
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

// ── Table styles ──────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  color: "#374151",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

// ── Reply Modal ───────────────────────────────────────────────────────────────

function ReplyModal({
  enquiry,
  open,
  onClose,
  onReply,
}: {
  enquiry: MarketplaceEnquiry | null;
  open: boolean;
  onClose: () => void;
  onReply: (id: string, message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!enquiry || !message.trim()) return;
    setLoading(true);
    try {
      await onReply(enquiry.id, message.trim());
      setMessage("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reply to Enquiry"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!message.trim() || loading}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="send" size={14} />
              {loading ? "Sending…" : "Send Reply"}
            </span>
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Original message */}
        {enquiry && (
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#9ca3af",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon name="user" size={12} />
              {enquiry.buyerName} — {formatDate(enquiry.createdAt)}
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>
              {enquiry.message}
            </p>
          </div>
        )}

        {/* Previous replies */}
        {enquiry?.replies && enquiry.replies.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
              Previous Replies
            </div>
            {enquiry.replies.map((reply) => (
              <div
                key={reply.id}
                style={{
                  background: "#ede9fe",
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <div style={{ fontSize: 12, color: "#7c3aed", marginBottom: 4 }}>
                  {reply.authorName} — {formatDate(reply.createdAt)}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                  {reply.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reply textarea */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Your Reply
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply here…"
            rows={5}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 14,
              color: "#374151",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function EnquiryList() {
  const { data, isLoading } = useVendorEnquiries();
  const replyMutation = useReplyEnquiry();
  const [selectedEnquiry, setSelectedEnquiry] =
    useState<MarketplaceEnquiry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const enquiries = useMemo<MarketplaceEnquiry[]>(() => {
    const raw = (data as any)?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const handleReply = async (id: string, message: string) => {
    try {
      await replyMutation.mutateAsync({ id, dto: { message } });
      toast.success("Reply sent");
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const openReplyModal = (enquiry: MarketplaceEnquiry) => {
    setSelectedEnquiry(enquiry);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon name="inbox" size={18} color="#6366f1" />
          <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
            Enquiries
          </span>
          <Badge variant="secondary" style={{ marginLeft: "auto" }}>
            {enquiries.length}
          </Badge>
        </div>

        {enquiries.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
            <div style={{ marginBottom: 10 }}>
              <Icon name="inbox" size={40} color="#9ca3af" />
            </div>
            <p style={{ margin: 0 }}>No enquiries yet</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Listing</th>
                  <th style={thStyle}>Buyer</th>
                  <th style={thStyle}>Message</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 500,
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {enquiry.listingTitle ?? "—"}
                    </td>
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{enquiry.buyerName}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>
                          {enquiry.buyerEmail}
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: 260,
                        color: "#6b7280",
                        fontStyle: "italic",
                      }}
                    >
                      {truncate(enquiry.message)}
                    </td>
                    <td style={tdStyle}>
                      <Badge variant={enquiryStatusVariant(enquiry.status)}>
                        {enquiry.status}
                      </Badge>
                    </td>
                    <td style={tdStyle}>{formatDate(enquiry.createdAt)}</td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReplyModal(enquiry)}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon name="send" size={14} />
                          Reply
                        </span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReplyModal
        enquiry={selectedEnquiry}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onReply={handleReply}
      />
    </>
  );
}
