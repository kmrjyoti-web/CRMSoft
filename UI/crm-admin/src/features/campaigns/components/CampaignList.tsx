"use client";

import { useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import { Icon, Button, Badge, SelectInput } from "@/components/ui";

import { useCampaigns } from "../hooks/useCampaigns";

import type { Campaign, CampaignStatus, CampaignFilters } from "../types/campaign.types";

// ── Status badge color map ──────────────────────────────

const STATUS_BADGE_VARIANT: Record<CampaignStatus, string> = {
  DRAFT: "secondary",
  SCHEDULED: "primary",
  RUNNING: "success",
  PAUSED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Running", value: "RUNNING" },
  { label: "Paused", value: "PAUSED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

// ── Helpers ─────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ───────────────────────────────────────────

export function CampaignList() {
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const filters = useMemo<CampaignFilters>(() => {
    const f: CampaignFilters = { page, limit };
    if (statusFilter) f.status = statusFilter as CampaignStatus;
    return f;
  }, [statusFilter, page]);

  const { data, isLoading } = useCampaigns(filters);

  const campaigns: Campaign[] = useMemo(() => {
    if (!data) return [];
    const d = data as any;
    if (Array.isArray(d.data)) return d.data;
    if (d.data?.data && Array.isArray(d.data.data)) return d.data.data;
    return [];
  }, [data]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    const d = data as any;
    const meta = d.data?.meta ?? d.meta;
    if (meta?.totalPages) return meta.totalPages;
    if (meta?.total) return Math.ceil(meta.total / limit);
    return 1;
  }, [data]);

  const handleRowClick = useCallback(
    (id: string) => {
      router.push(`/campaigns/${id}`);
    },
    [router],
  );

  const handleStatusChange = useCallback((value: string | number | boolean | null) => {
    setStatusFilter(value as string ?? "");
    setPage(1);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      {/* ── Header ────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Email Campaigns</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 200 }}>
            <SelectInput
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={handleStatusChange}
              leftIcon={<Icon name="filter" size={16} />}
            />
          </div>

          <Button
            variant="primary"
            onClick={() => router.push("/campaigns/new")}
          >
            <Icon name="plus" size={16} />
            New Campaign
          </Button>
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────── */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          Loading campaigns...
        </div>
      )}

      {/* ── Empty state ──────────────────────────────── */}
      {!isLoading && campaigns.length === 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 60,
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <Icon name="mail" size={48} style={{ color: "#d1d5db", marginBottom: 16 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>
            No campaigns found
          </p>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 20px" }}>
            {statusFilter
              ? "Try changing the status filter."
              : "Create your first email campaign to get started."}
          </p>
          {!statusFilter && (
            <Button variant="primary" onClick={() => router.push("/campaigns/new")}>
              <Icon name="plus" size={16} />
              Create Campaign
            </Button>
          )}
        </div>
      )}

      {/* ── Campaign cards ───────────────────────────── */}
      {!isLoading && campaigns.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => handleRowClick(campaign.id)}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 20,
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Row 1: Name + Status */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                    {campaign.name}
                  </span>
                  <Badge variant={STATUS_BADGE_VARIANT[campaign.status] as any}>
                    {campaign.status}
                  </Badge>
                </div>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {formatDate(campaign.createdAt)}
                </span>
              </div>

              {/* Row 2: Stats */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <StatItem icon="users" label="Recipients" value={campaign.totalRecipients} />
                <StatItem icon="send" label="Sent" value={campaign.sentCount} />
                <StatItem icon="eye" label="Opened" value={campaign.openedCount} />
                <StatItem icon="mouse-pointer" label="Clicked" value={campaign.clickedCount} />
                {campaign.scheduledAt && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
                    <Icon name="clock" size={14} />
                    <span>Scheduled: {formatDate(campaign.scheduledAt)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────── */}
      {!isLoading && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24 }}>
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
    </div>
  );
}

// ── Stat item helper ──────────────────────────────────

function StatItem({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
      <Icon name={icon as any} size={14} />
      <span>{label}:</span>
      <span style={{ fontWeight: 600, color: "#374151" }}>{value}</span>
    </div>
  );
}
