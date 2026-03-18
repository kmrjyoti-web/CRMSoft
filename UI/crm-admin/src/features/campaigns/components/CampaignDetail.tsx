"use client";

import { useState, useMemo, useCallback } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Icon, Button, Badge } from "@/components/ui";

import {
  useCampaign,
  useStartCampaign,
  usePauseCampaign,
  useCancelCampaign,
} from "../hooks/useCampaigns";

import type { Campaign, CampaignStatus } from "../types/campaign.types";

import { RecipientManager } from "./RecipientManager";
import { CampaignAnalytics } from "./CampaignAnalytics";
import { formatDate } from "@/lib/format-date";

// ── Types ───────────────────────────────────────────────

interface CampaignDetailProps {
  campaignId: string;
}

type TabKey = "details" | "recipients" | "analytics";

// ── Status badge color map ──────────────────────────────

const STATUS_BADGE_VARIANT: Record<CampaignStatus, string> = {
  DRAFT: "secondary",
  SCHEDULED: "primary",
  RUNNING: "success",
  PAUSED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

// ── Helpers ─────────────────────────────────────────────


// ── Tab definitions ─────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "details", label: "Details", icon: "file-text" },
  { key: "recipients", label: "Recipients", icon: "users" },
  { key: "analytics", label: "Analytics", icon: "bar-chart-2" },
];

// ── Component ───────────────────────────────────────────

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  // ── Queries & Mutations ─────────────────────────────

  const { data: campaignData, isLoading } = useCampaign(campaignId);
  const startMutation = useStartCampaign();
  const pauseMutation = usePauseCampaign();
  const cancelMutation = useCancelCampaign();

  const campaign: Campaign | null = useMemo(() => {
    if (!campaignData) return null;
    const d = (campaignData as any).data ?? campaignData;
    return d as Campaign;
  }, [campaignData]);

  // ── Action handlers ─────────────────────────────────

  const handleStart = useCallback(async () => {
    try {
      await startMutation.mutateAsync(campaignId);
      toast.success("Campaign started");
    } catch {
      toast.error("Failed to start campaign");
    }
  }, [campaignId, startMutation]);

  const handlePause = useCallback(async () => {
    try {
      await pauseMutation.mutateAsync(campaignId);
      toast.success("Campaign paused");
    } catch {
      toast.error("Failed to pause campaign");
    }
  }, [campaignId, pauseMutation]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelMutation.mutateAsync(campaignId);
      toast.success("Campaign cancelled");
    } catch {
      toast.error("Failed to cancel campaign");
    }
  }, [campaignId, cancelMutation]);

  // ── Loading state ───────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
        Loading campaign...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
        Campaign not found.
      </div>
    );
  }

  // ── Determine action buttons based on status ────────

  const actionButtons: React.ReactNode[] = [];

  if (campaign.status === "DRAFT") {
    actionButtons.push(
      <Button
        key="edit"
        variant="outline"
        onClick={() => router.push(`/campaigns/${campaignId}/edit`)}
      >
        <Icon name="edit" size={16} />
        Edit
      </Button>,
      <Button
        key="start"
        variant="primary"
        onClick={handleStart}
        disabled={startMutation.isPending}
      >
        <Icon name="play" size={16} />
        {startMutation.isPending ? "Starting..." : "Start"}
      </Button>,
    );
  }

  if (campaign.status === "SCHEDULED") {
    actionButtons.push(
      <Button
        key="cancel"
        variant="danger"
        onClick={handleCancel}
        disabled={cancelMutation.isPending}
      >
        <Icon name="x-circle" size={16} />
        {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
      </Button>,
    );
  }

  if (campaign.status === "RUNNING") {
    actionButtons.push(
      <Button
        key="pause"
        variant="outline"
        onClick={handlePause}
        disabled={pauseMutation.isPending}
      >
        <Icon name="pause" size={16} />
        {pauseMutation.isPending ? "Pausing..." : "Pause"}
      </Button>,
    );
  }

  if (campaign.status === "PAUSED") {
    actionButtons.push(
      <Button
        key="resume"
        variant="primary"
        onClick={handleStart}
        disabled={startMutation.isPending}
      >
        <Icon name="play" size={16} />
        {startMutation.isPending ? "Resuming..." : "Resume"}
      </Button>,
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* ── Header ────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button variant="ghost" onClick={() => router.push("/campaigns")}>
            <Icon name="arrow-left" size={18} />
          </Button>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{campaign.name}</h1>
          <Badge variant={STATUS_BADGE_VARIANT[campaign.status] as any}>
            {campaign.status}
          </Badge>
        </div>

        <div style={{ display: "flex", gap: 8 }}>{actionButtons}</div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "2px solid #e5e7eb",
          marginBottom: 24,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? "var(--color-primary, #3b82f6)" : "#6b7280",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--color-primary, #3b82f6)" : "2px solid transparent",
              marginBottom: -2,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <Icon name={tab.icon as any} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────── */}
      {activeTab === "details" && (
        <DetailsTab campaign={campaign} />
      )}

      {activeTab === "recipients" && (
        <RecipientManager campaignId={campaignId} />
      )}

      {activeTab === "analytics" && (
        <CampaignAnalytics campaignId={campaignId} />
      )}
    </div>
  );
}

// ── Details tab ─────────────────────────────────────────

function DetailsTab({ campaign }: { campaign: Campaign }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Campaign info ──────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#111827" }}>
          Campaign Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <DetailRow icon="mail" label="Subject" value={campaign.subject} />
          <DetailRow icon="user" label="From Name" value={campaign.fromName || "—"} />
          <DetailRow icon="corner-up-left" label="Reply To" value={campaign.replyToEmail || "—"} />
          <DetailRow icon="server" label="Account ID" value={campaign.accountId} />
          <DetailRow icon="clock" label="Scheduled At" value={formatDate(campaign.scheduledAt)} />
          <DetailRow icon="calendar" label="Created At" value={formatDate(campaign.createdAt)} />
          {campaign.startedAt && (
            <DetailRow icon="play" label="Started At" value={formatDate(campaign.startedAt)} />
          )}
          {campaign.completedAt && (
            <DetailRow icon="check-circle" label="Completed At" value={formatDate(campaign.completedAt)} />
          )}
        </div>
      </div>

      {/* ── Settings summary ───────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#111827" }}>
          Settings
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <SettingItem label="Send Rate" value={`${campaign.sendRatePerMinute}/min`} />
          <SettingItem label="Batch Size" value={`${campaign.batchSize}`} />
          <SettingItem label="Track Opens" value={campaign.trackOpens ? "Enabled" : "Disabled"} enabled={campaign.trackOpens} />
          <SettingItem label="Track Clicks" value={campaign.trackClicks ? "Enabled" : "Disabled"} enabled={campaign.trackClicks} />
          <SettingItem label="Unsubscribe Link" value={campaign.includeUnsubscribe ? "Included" : "Not included"} enabled={campaign.includeUnsubscribe} />
        </div>
      </div>

      {/* ── Body preview ───────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#111827" }}>
          Email Body Preview
        </h3>
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: 16,
            border: "1px solid #e5e7eb",
            maxHeight: 400,
            overflow: "auto",
            fontSize: 14,
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: campaign.bodyHtml }}
        />
      </div>

      {/* ── Quick stats ────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "#111827" }}>
          Quick Stats
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
          <QuickStat label="Recipients" value={campaign.totalRecipients} />
          <QuickStat label="Sent" value={campaign.sentCount} />
          <QuickStat label="Delivered" value={campaign.deliveredCount} />
          <QuickStat label="Opened" value={campaign.openedCount} />
          <QuickStat label="Clicked" value={campaign.clickedCount} />
          <QuickStat label="Bounced" value={campaign.bouncedCount} />
          <QuickStat label="Replied" value={campaign.repliedCount} />
          <QuickStat label="Unsubscribed" value={campaign.unsubscribedCount} />
        </div>
      </div>
    </div>
  );
}

// ── Detail row helper ───────────────────────────────────

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <Icon name={icon as any} size={16} style={{ color: "#9ca3af", marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

// ── Setting item helper ─────────────────────────────────

function SettingItem({ label, value, enabled }: { label: string; value: string; enabled?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: enabled === undefined ? "#374151" : enabled ? "#10b981" : "#9ca3af",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Quick stat helper ───────────────────────────────────

function QuickStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af" }}>{label}</div>
    </div>
  );
}
