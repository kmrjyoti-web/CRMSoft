"use client";

import { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import {
  Icon,
  Button,
  Input,
  NumberInput,
  RichTextEditor,
  DatePicker,
  Checkbox,
} from "@/components/ui";

import {
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
} from "../hooks/useCampaigns";

import type { CreateCampaignDto } from "../types/campaign.types";

// ── Types ───────────────────────────────────────────────

interface CampaignBuilderProps {
  campaignId?: string;
}

interface FormData {
  name: string;
  description: string;
  subject: string;
  accountId: string;
  fromName: string;
  replyToEmail: string;
  bodyHtml: string;
  bodyText: string;
  sendRatePerMinute: number | null;
  batchSize: number | null;
  trackOpens: boolean;
  trackClicks: boolean;
  includeUnsubscribe: boolean;
  scheduledAt: string;
  sendImmediately: boolean;
}

const INITIAL_FORM: FormData = {
  name: "",
  description: "",
  subject: "",
  accountId: "",
  fromName: "",
  replyToEmail: "",
  bodyHtml: "",
  bodyText: "",
  sendRatePerMinute: 60,
  batchSize: 100,
  trackOpens: true,
  trackClicks: true,
  includeUnsubscribe: true,
  scheduledAt: "",
  sendImmediately: false,
};

const STEPS = [
  { number: 1, label: "Details" },
  { number: 2, label: "Content" },
  { number: 3, label: "Settings" },
  { number: 4, label: "Schedule" },
];

// ── Component ───────────────────────────────────────────

export function CampaignBuilder({ campaignId }: CampaignBuilderProps) {
  const router = useRouter();
  const isEditMode = !!campaignId;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  // ── Queries & Mutations ─────────────────────────────

  const { data: existingCampaign, isLoading: isLoadingCampaign } = useCampaign(
    campaignId ?? "",
  );
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();

  // ── Pre-fill for edit mode ──────────────────────────

  useEffect(() => {
    if (!isEditMode || !existingCampaign) return;
    const c = (existingCampaign as any).data ?? existingCampaign;
    setForm({
      name: c.name ?? "",
      description: c.description ?? "",
      subject: c.subject ?? "",
      accountId: c.accountId ?? "",
      fromName: c.fromName ?? "",
      replyToEmail: c.replyToEmail ?? "",
      bodyHtml: c.bodyHtml ?? "",
      bodyText: c.bodyText ?? "",
      sendRatePerMinute: c.sendRatePerMinute ?? 60,
      batchSize: c.batchSize ?? 100,
      trackOpens: c.trackOpens ?? true,
      trackClicks: c.trackClicks ?? true,
      includeUnsubscribe: c.includeUnsubscribe ?? true,
      scheduledAt: c.scheduledAt ?? "",
      sendImmediately: false,
    });
  }, [isEditMode, existingCampaign]);

  // ── Field change handlers ───────────────────────────

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ── Build DTO ───────────────────────────────────────

  function buildDto(): CreateCampaignDto {
    const dto: CreateCampaignDto = {
      name: form.name,
      subject: form.subject,
      bodyHtml: form.bodyHtml,
      accountId: form.accountId,
    };
    if (form.description) dto.description = form.description;
    if (form.bodyText) dto.bodyText = form.bodyText;
    if (form.fromName) dto.fromName = form.fromName;
    if (form.replyToEmail) dto.replyToEmail = form.replyToEmail;
    if (form.sendRatePerMinute !== null) dto.sendRatePerMinute = form.sendRatePerMinute;
    if (form.batchSize !== null) dto.batchSize = form.batchSize;
    dto.trackOpens = form.trackOpens;
    dto.trackClicks = form.trackClicks;
    dto.includeUnsubscribe = form.includeUnsubscribe;
    if (!form.sendImmediately && form.scheduledAt) {
      dto.scheduledAt = form.scheduledAt;
    }
    return dto;
  }

  // ── Save handlers ───────────────────────────────────

  const handleSaveDraft = useCallback(async () => {
    try {
      const dto = buildDto();
      if (isEditMode && campaignId) {
        await updateMutation.mutateAsync({ id: campaignId, dto });
        toast.success("Campaign updated");
      } else {
        await createMutation.mutateAsync(dto);
        toast.success("Campaign saved as draft");
      }
      router.push("/campaigns");
    } catch {
      toast.error("Failed to save campaign");
    }
  }, [form, isEditMode, campaignId]);

  const handleSchedule = useCallback(async () => {
    try {
      const dto = buildDto();
      if (!form.sendImmediately && !form.scheduledAt) {
        toast.error("Please set a schedule date or select Send Immediately");
        return;
      }
      if (isEditMode && campaignId) {
        await updateMutation.mutateAsync({ id: campaignId, dto });
        toast.success("Campaign scheduled");
      } else {
        await createMutation.mutateAsync(dto);
        toast.success("Campaign created and scheduled");
      }
      router.push("/campaigns");
    } catch {
      toast.error("Failed to schedule campaign");
    }
  }, [form, isEditMode, campaignId]);

  // ── Navigation ──────────────────────────────────────

  const canGoNext = useCallback((): boolean => {
    if (step === 1) return !!(form.name && form.subject && form.accountId);
    if (step === 2) return !!form.bodyHtml;
    return true;
  }, [step, form]);

  // ── Loading state ───────────────────────────────────

  if (isEditMode && isLoadingCampaign) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
        Loading campaign...
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      {/* ── Header ──────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Button variant="ghost" onClick={() => router.push("/campaigns")}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          {isEditMode ? "Edit Campaign" : "New Campaign"}
        </h1>
      </div>

      {/* ── Step indicator ──────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 32,
        }}
      >
        {STEPS.map((s, idx) => (
          <div key={s.number} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              onClick={() => {
                if (s.number < step) setStep(s.number);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: s.number <= step ? "pointer" : "default",
                opacity: s.number > step ? 0.4 : 1,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  background: s.number === step ? "var(--color-primary, #3b82f6)" : s.number < step ? "#10b981" : "#e5e7eb",
                  color: s.number <= step ? "#fff" : "#9ca3af",
                }}
              >
                {s.number < step ? (
                  <Icon name="check" size={16} />
                ) : (
                  s.number
                )}
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: s.number === step ? 600 : 400,
                  color: s.number === step ? "#111827" : "#6b7280",
                }}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  background: s.number < step ? "#10b981" : "#e5e7eb",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Step content card ───────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          border: "1px solid #e5e7eb",
          marginBottom: 24,
        }}
      >
        {/* ── Step 1: Details ────────────────────────── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Campaign Details</h2>

            <Input
              label="Campaign Name"
              value={form.name}
              onChange={(v: any) => updateField("name", typeof v === "string" ? v : v?.target?.value ?? "")}
              leftIcon={<Icon name="type" size={16} />}
              required
            />

            <Input
              label="Description"
              value={form.description}
              onChange={(v: any) => updateField("description", typeof v === "string" ? v : v?.target?.value ?? "")}
              leftIcon={<Icon name="file-text" size={16} />}
            />

            <Input
              label="Email Subject"
              value={form.subject}
              onChange={(v: any) => updateField("subject", typeof v === "string" ? v : v?.target?.value ?? "")}
              leftIcon={<Icon name="mail" size={16} />}
              required
            />

            <Input
              label="Account ID"
              value={form.accountId}
              onChange={(v: any) => updateField("accountId", typeof v === "string" ? v : v?.target?.value ?? "")}
              leftIcon={<Icon name="server" size={16} />}
              required
            />

            <Input
              label="From Name"
              value={form.fromName}
              onChange={(v: any) => updateField("fromName", typeof v === "string" ? v : v?.target?.value ?? "")}
              leftIcon={<Icon name="user" size={16} />}
            />

            <Input
              label="Reply-To Email"
              value={form.replyToEmail}
              onChange={(v: any) => updateField("replyToEmail", typeof v === "string" ? v : v?.target?.value ?? "")}
              leftIcon={<Icon name="corner-up-left" size={16} />}
            />
          </div>
        )}

        {/* ── Step 2: Content ───────────────────────── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Email Content</h2>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                HTML Body <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <RichTextEditor
                value={form.bodyHtml}
                onChange={(html: any) => updateField("bodyHtml", typeof html === "string" ? html : "")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                Plain Text Body (optional)
              </label>
              <textarea
                value={form.bodyText}
                onChange={(e) => updateField("bodyText", e.target.value)}
                rows={6}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                  fontFamily: "monospace",
                  resize: "vertical",
                  outline: "none",
                }}
                placeholder="Optional plain text version for email clients that don't support HTML..."
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Settings ──────────────────────── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Campaign Settings</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <NumberInput
                label="Send Rate (per minute)"
                value={form.sendRatePerMinute}
                onChange={(v: any) => updateField("sendRatePerMinute", typeof v === "number" ? v : null)}
              />

              <NumberInput
                label="Batch Size"
                value={form.batchSize}
                onChange={(v: any) => updateField("batchSize", typeof v === "number" ? v : null)}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>
                Tracking Options
              </h3>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <Checkbox
                  checked={form.trackOpens}
                  onChange={() => updateField("trackOpens", !form.trackOpens)}
                />
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>Track Opens</span>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                    Insert tracking pixel to detect when emails are opened
                  </p>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <Checkbox
                  checked={form.trackClicks}
                  onChange={() => updateField("trackClicks", !form.trackClicks)}
                />
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>Track Clicks</span>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                    Rewrite links to track click-through rates
                  </p>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <Checkbox
                  checked={form.includeUnsubscribe}
                  onChange={() => updateField("includeUnsubscribe", !form.includeUnsubscribe)}
                />
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>Include Unsubscribe Link</span>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                    Automatically append an unsubscribe link to each email
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ── Step 4: Schedule ──────────────────────── */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Schedule</h2>

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <Checkbox
                checked={form.sendImmediately}
                onChange={() => updateField("sendImmediately", !form.sendImmediately)}
              />
              <div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
                  Send Immediately
                </span>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
                  Campaign will be queued for immediate sending upon creation
                </p>
              </div>
            </label>

            {!form.sendImmediately && (
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  Schedule Date & Time
                </label>
                <DatePicker
                  label="Scheduled At"
                  value={form.scheduledAt}
                  onChange={(v: any) => updateField("scheduledAt", v ?? "")}
                />
              </div>
            )}

            {/* Summary */}
            <div
              style={{
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>
                Campaign Summary
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                <SummaryRow label="Name" value={form.name || "—"} />
                <SummaryRow label="Subject" value={form.subject || "—"} />
                <SummaryRow label="From" value={form.fromName || "—"} />
                <SummaryRow label="Reply To" value={form.replyToEmail || "—"} />
                <SummaryRow label="Send Rate" value={form.sendRatePerMinute !== null ? `${form.sendRatePerMinute}/min` : "—"} />
                <SummaryRow label="Batch Size" value={form.batchSize !== null ? `${form.batchSize}` : "—"} />
                <SummaryRow label="Track Opens" value={form.trackOpens ? "Yes" : "No"} />
                <SummaryRow label="Track Clicks" value={form.trackClicks ? "Yes" : "No"} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation buttons ──────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <Icon name="arrow-left" size={16} />
              Back
            </Button>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {step < 4 && (
            <Button
              variant="primary"
              disabled={!canGoNext()}
              onClick={() => setStep((s) => s + 1)}
            >
              Next
              <Icon name="arrow-right" size={16} />
            </Button>
          )}

          {step === 4 && (
            <>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Icon name="save" size={16} />
                Save as Draft
              </Button>
              <Button
                variant="primary"
                onClick={handleSchedule}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Icon name="send" size={16} />
                {form.sendImmediately ? "Create & Send" : "Schedule Campaign"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Summary row helper ──────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: "#9ca3af" }}>{label}: </span>
      <span style={{ color: "#374151", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
