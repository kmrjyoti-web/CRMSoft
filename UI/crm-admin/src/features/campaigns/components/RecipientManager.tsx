"use client";

import { useState, useMemo, useCallback } from "react";

import toast from "react-hot-toast";

import { Icon, Button, Badge, Modal } from "@/components/ui";

import { useCampaignRecipients, useAddRecipients } from "../hooks/useCampaigns";

import type { CampaignRecipient } from "../types/campaign.types";

// ── Types ───────────────────────────────────────────────

interface RecipientManagerProps {
  campaignId: string;
}

// ── Status badge color map ──────────────────────────────

const RECIPIENT_STATUS_VARIANT: Record<CampaignRecipient["status"], string> = {
  PENDING: "secondary",
  SENT: "primary",
  DELIVERED: "success",
  OPENED: "success",
  CLICKED: "success",
  BOUNCED: "danger",
  UNSUBSCRIBED: "warning",
};

// ── Helpers ─────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ───────────────────────────────────────────

export function RecipientManager({ campaignId }: RecipientManagerProps) {
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");

  const limit = 20;

  const { data, isLoading } = useCampaignRecipients(campaignId, { page, limit });
  const addRecipientsMutation = useAddRecipients();

  const recipients: CampaignRecipient[] = useMemo(() => {
    if (!data) return [];
    const d = data as any;
    if (Array.isArray(d.data)) return d.data;
    if (d.data?.data && Array.isArray(d.data.data)) return d.data.data;
    return [];
  }, [data]);

  const totalCount = useMemo(() => {
    if (!data) return 0;
    const d = data as any;
    const meta = d.data?.meta ?? d.meta;
    return meta?.total ?? recipients.length;
  }, [data, recipients.length]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    const d = data as any;
    const meta = d.data?.meta ?? d.meta;
    if (meta?.totalPages) return meta.totalPages;
    if (meta?.total) return Math.ceil(meta.total / limit);
    return 1;
  }, [data]);

  const handleAddRecipients = useCallback(async () => {
    const lines = bulkEmails
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    const recipients = lines.map((line) => {
      // Support "Name <email>" or just "email" format
      const match = line.match(/^(.+?)\s*<(.+?)>$/);
      if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
      }
      return { email: line };
    });

    try {
      await addRecipientsMutation.mutateAsync({
        id: campaignId,
        dto: { recipients },
      });
      toast.success(`${recipients.length} recipient(s) added`);
      setBulkEmails("");
      setShowAddModal(false);
    } catch {
      toast.error("Failed to add recipients");
    }
  }, [bulkEmails, campaignId, addRecipientsMutation]);

  return (
    <div>
      {/* ── Header ────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Recipients</h2>
          <Badge variant="secondary">{totalCount}</Badge>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Icon name="user-plus" size={16} />
          Add Recipients
        </Button>
      </div>

      {/* ── Loading ───────────────────────────────────── */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Loading recipients...
        </div>
      )}

      {/* ── Empty state ──────────────────────────────── */}
      {!isLoading && recipients.length === 0 && (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: 40,
            textAlign: "center",
            border: "1px solid #e5e7eb",
          }}
        >
          <Icon name="users" size={40} style={{ color: "#d1d5db", marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            No recipients added yet. Click "Add Recipients" to get started.
          </p>
        </div>
      )}

      {/* ── Recipients table ─────────────────────────── */}
      {!isLoading && recipients.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Sent At</th>
                <th style={thStyle}>Opened At</th>
                <th style={thStyle}>Clicked At</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={tdStyle}>{r.email}</td>
                  <td style={tdStyle}>{r.name || "—"}</td>
                  <td style={tdStyle}>
                    <Badge variant={RECIPIENT_STATUS_VARIANT[r.status] as any}>
                      {r.status}
                    </Badge>
                  </td>
                  <td style={tdStyle}>{formatDate(r.sentAt)}</td>
                  <td style={tdStyle}>{formatDate(r.openedAt)}</td>
                  <td style={tdStyle}>{formatDate(r.clickedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ───────────────────────────────── */}
      {!isLoading && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Icon name="chevron-left" size={16} />
            Previous
          </Button>
          <span style={{ fontSize: 14, color: "#6b7280" }}>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <Icon name="chevron-right" size={16} />
          </Button>
        </div>
      )}

      {/* ── Add Recipients Modal ─────────────────────── */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setBulkEmails("");
        }}
        title="Add Recipients"
      >
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 12px" }}>
            Enter email addresses, one per line. Optionally include a name using the format:{" "}
            <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
              Name &lt;email@example.com&gt;
            </code>
          </p>

          <textarea
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            rows={10}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              fontFamily: "monospace",
              resize: "vertical",
              outline: "none",
              marginBottom: 16,
            }}
            placeholder={"john@example.com\nJane Doe <jane@example.com>\nbob@example.com"}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setBulkEmails("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddRecipients}
              disabled={addRecipientsMutation.isPending}
            >
              <Icon name="plus" size={16} />
              {addRecipientsMutation.isPending ? "Adding..." : "Add Recipients"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Table styles ────────────────────────────────────────

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 16px",
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 14,
  color: "#374151",
};
