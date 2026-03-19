"use client";

import { useMemo } from "react";

import { Icon } from "@/components/ui";

import { useCampaignStats, useCampaign } from "../hooks/useCampaigns";

import type { CampaignStats, Campaign } from "../types/campaign.types";
import { formatDate } from "@/lib/format-date";

// ── Types ───────────────────────────────────────────────

interface CampaignAnalyticsProps {
  campaignId: string;
}

// ── Helpers ─────────────────────────────────────────────


function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// ── Component ───────────────────────────────────────────

export function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  const { data: statsData, isLoading: isLoadingStats } = useCampaignStats(campaignId);
  const { data: campaignData, isLoading: isLoadingCampaign } = useCampaign(campaignId);

  const stats: CampaignStats | null = useMemo(() => {
    if (!statsData) return null;
    return statsData.data ?? statsData;
  }, [statsData]);

  const campaign: Campaign | null = useMemo(() => {
    if (!campaignData) return null;
    return campaignData.data ?? campaignData;
  }, [campaignData]);

  if (isLoadingStats || isLoadingCampaign) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
        Loading analytics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
        No analytics data available.
      </div>
    );
  }

  const sentProgress = stats.totalRecipients > 0
    ? (stats.sentCount / stats.totalRecipients) * 100
    : 0;

  return (
    <div>
      {/* ── Campaign timing info ─────────────────────── */}
      {campaign && (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
            border: "1px solid #e5e7eb",
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            fontSize: 13,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280" }}>
            <Icon name="info" size={14} />
            <span>Status: <strong style={{ color: "#374151" }}>{campaign.status}</strong></span>
          </div>
          {campaign.scheduledAt && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280" }}>
              <Icon name="clock" size={14} />
              <span>Scheduled: <strong style={{ color: "#374151" }}>{formatDate(campaign.scheduledAt)}</strong></span>
            </div>
          )}
          {campaign.startedAt && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280" }}>
              <Icon name="play" size={14} />
              <span>Started: <strong style={{ color: "#374151" }}>{formatDate(campaign.startedAt)}</strong></span>
            </div>
          )}
          {campaign.completedAt && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280" }}>
              <Icon name="check-circle" size={14} />
              <span>Completed: <strong style={{ color: "#374151" }}>{formatDate(campaign.completedAt)}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* ── Progress bar ─────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Sending Progress</span>
          <span style={{ fontSize: 14, color: "#6b7280" }}>
            {stats.sentCount} / {stats.totalRecipients} sent
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 12,
            background: "#e5e7eb",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(sentProgress, 100)}%`,
              height: "100%",
              background: "var(--color-primary, #3b82f6)",
              borderRadius: 6,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
          {sentProgress.toFixed(1)}%
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StatCard icon="users" label="Total Recipients" value={stats.totalRecipients} color="#6366f1" />
        <StatCard icon="send" label="Sent" value={stats.sentCount} color="#3b82f6" />
        <StatCard icon="check-circle" label="Delivered" value={stats.deliveredCount} color="#10b981" />
        <StatCard icon="eye" label="Opened" value={stats.openedCount} color="#8b5cf6" />
        <StatCard icon="mouse-pointer" label="Clicked" value={stats.clickedCount} color="#f59e0b" />
        <StatCard icon="alert-triangle" label="Bounced" value={stats.bouncedCount} color="#ef4444" />
        <StatCard icon="user-x" label="Unsubscribed" value={stats.unsubscribedCount} color="#f97316" />
      </div>

      {/* ── Rate cards ───────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        <RateCard
          label="Open Rate"
          value={stats.openRate}
          icon="eye"
          color="#8b5cf6"
        />
        <RateCard
          label="Click Rate"
          value={stats.clickRate}
          icon="mouse-pointer"
          color="#f59e0b"
        />
        <RateCard
          label="Bounce Rate"
          value={stats.bounceRate}
          icon="alert-triangle"
          color="#ef4444"
        />
      </div>
    </div>
  );
}

// ── Stat card helper ────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${color}14`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon as any} size={16} style={{ color }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>{label}</div>
      </div>
    </div>
  );
}

// ── Rate card helper ────────────────────────────────────

function RateCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  const percent = (value * 100).toFixed(1);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #e5e7eb",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: `${color}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
        }}
      >
        <Icon name={icon as any} size={20} style={{ color }} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
        {percent}%
      </div>
      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{label}</div>
    </div>
  );
}
