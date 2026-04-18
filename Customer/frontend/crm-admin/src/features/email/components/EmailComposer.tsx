"use client";

import { useState, useCallback, useMemo, KeyboardEvent } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import {
  Icon,
  Input,
  SelectInput,
  Button,
  Badge,
  RichTextEditor,
  DatePicker,
} from "@/components/ui";

import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  useEmailAccounts,
  useEmail,
  useComposeEmail,
  useReplyEmail,
} from "../hooks/useEmail";

import type {
  EmailAddress,
  ComposeEmailDto,
  ReplyEmailDto,
  EmailPriority,
} from "../types/email.types";

// ── Props ─────────────────────────────────────────────────

interface EmailComposerProps {
  mode?: "page" | "modal";
  replyTo?: {
    emailId: string;
    type: "REPLY" | "REPLY_ALL" | "FORWARD";
  };
  entityType?: string;
  entityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ── Helpers ───────────────────────────────────────────────

function parseEmailAddresses(raw: string): EmailAddress[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
}

function formatEmailAddresses(addresses: EmailAddress[]): string {
  return addresses.map((a) => a.email).join(", ");
}

const PRIORITY_OPTIONS = [
  { label: "Low", value: "LOW" },
  { label: "Normal", value: "NORMAL" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

// ── Component ─────────────────────────────────────────────

export function EmailComposer({
  mode = "page",
  replyTo,
  entityType,
  entityId,
  onSuccess,
  onCancel,
}: EmailComposerProps) {
  const router = useRouter();

  // ── Accounts ──
  const { data: accountsData, isLoading: accountsLoading } = useEmailAccounts();
  const accounts = useMemo(() => {
    const raw = accountsData?.data;
    return Array.isArray(raw) ? raw : [];
  }, [accountsData]);

  // ── Original email for replies ──
  const { data: originalData } = useEmail(replyTo?.emailId ?? "");
  const originalEmail = originalData?.data;

  // ── Form state ──
  const [accountId, setAccountId] = useState("");
  const [toRaw, setToRaw] = useState("");
  const [toTags, setToTags] = useState<string[]>([]);
  const [ccRaw, setCcRaw] = useState("");
  const [bccRaw, setBccRaw] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [priority, setPriority] = useState<EmailPriority>("NORMAL");
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  // ── Set default account ──
  useMemo(() => {
    if (!accountId && accounts.length > 0) {
      const defaultAcc = accounts.find((a) => a.isDefault) ?? accounts[0];
      setAccountId(defaultAcc.id);
    }
  }, [accounts, accountId]);

  // ── Pre-fill from original email (reply/forward) ──
  useMemo(() => {
    if (!originalEmail || !replyTo) return;

    if (replyTo.type === "REPLY") {
      setToTags([originalEmail.from]);
      setSubject(`Re: ${originalEmail.subject}`);
      setBodyHtml(
        `<br/><br/><hr/><p>On ${new Date(originalEmail.sentAt ?? originalEmail.createdAt).toLocaleString()}, ${originalEmail.fromName ?? originalEmail.from} wrote:</p><blockquote>${originalEmail.bodyHtml}</blockquote>`
      );
    } else if (replyTo.type === "REPLY_ALL") {
      setToTags([originalEmail.from, ...(originalEmail.to ?? [])]);
      if (originalEmail.cc?.length) {
        setCcRaw(originalEmail.cc.join(", "));
        setShowCc(true);
      }
      setSubject(`Re: ${originalEmail.subject}`);
      setBodyHtml(
        `<br/><br/><hr/><p>On ${new Date(originalEmail.sentAt ?? originalEmail.createdAt).toLocaleString()}, ${originalEmail.fromName ?? originalEmail.from} wrote:</p><blockquote>${originalEmail.bodyHtml}</blockquote>`
      );
    } else if (replyTo.type === "FORWARD") {
      setSubject(`Fwd: ${originalEmail.subject}`);
      setBodyHtml(
        `<br/><br/><hr/><p>---------- Forwarded message ----------</p><p>From: ${originalEmail.fromName ?? originalEmail.from}</p><p>Date: ${new Date(originalEmail.sentAt ?? originalEmail.createdAt).toLocaleString()}</p><p>Subject: ${originalEmail.subject}</p><p>To: ${originalEmail.to?.join(", ")}</p><br/>${originalEmail.bodyHtml}`
      );
    }
  }, [originalEmail, replyTo]);

  // ── Mutations ──
  const composeMutation = useComposeEmail();
  const replyMutation = useReplyEmail();
  const isSending = composeMutation.isPending || replyMutation.isPending;

  // ── To field tag management ──
  const handleToKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "Enter" || e.key === "," || e.key === "Tab") && toRaw.trim()) {
        e.preventDefault();
        const emails = toRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setToTags((prev) => [...prev, ...emails.filter((em) => !prev.includes(em))]);
        setToRaw("");
      }
      if (e.key === "Backspace" && !toRaw && toTags.length > 0) {
        setToTags((prev) => prev.slice(0, -1));
      }
    },
    [toRaw, toTags],
  );

  const removeToTag = useCallback((email: string) => {
    setToTags((prev) => prev.filter((t) => t !== email));
  }, []);

  // ── Submit handlers ──
  const getAllTo = useCallback((): EmailAddress[] => {
    const fromTags = toTags.map((email) => ({ email }));
    const fromRaw = parseEmailAddresses(toRaw);
    return [...fromTags, ...fromRaw];
  }, [toTags, toRaw]);

  const handleSendNow = useCallback(async () => {
    const toAddresses = getAllTo();
    if (!toAddresses.length) {
      toast.error("Please add at least one recipient");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!accountId) {
      toast.error("Please select a sender account");
      return;
    }

    try {
      if (replyTo) {
        const dto: ReplyEmailDto = {
          originalEmailId: replyTo.emailId,
          replyType: replyTo.type,
          to: toAddresses,
          bodyHtml,
        };
        await replyMutation.mutateAsync(dto);
      } else {
        const dto: ComposeEmailDto = {
          accountId,
          to: toAddresses,
          cc: showCc ? parseEmailAddresses(ccRaw) : undefined,
          bcc: showBcc ? parseEmailAddresses(bccRaw) : undefined,
          subject,
          bodyHtml,
          sendNow: true,
          entityType,
          entityId,
          priority,
          trackOpens,
          trackClicks,
        };
        await composeMutation.mutateAsync(dto);
      }
      toast.success("Email sent successfully");
      onSuccess?.();
      if (mode === "page") router.push("/email");
    } catch {
      toast.error("Failed to send email");
    }
  }, [
    getAllTo, subject, accountId, replyTo, bodyHtml, showCc, ccRaw, showBcc,
    bccRaw, entityType, entityId, priority, trackOpens, trackClicks,
    composeMutation, replyMutation, onSuccess, mode, router,
  ]);

  const handleSaveDraft = useCallback(async () => {
    try {
      const dto: ComposeEmailDto = {
        accountId,
        to: getAllTo(),
        cc: showCc ? parseEmailAddresses(ccRaw) : undefined,
        bcc: showBcc ? parseEmailAddresses(bccRaw) : undefined,
        subject,
        bodyHtml,
        sendNow: false,
        entityType,
        entityId,
        priority,
        trackOpens,
        trackClicks,
      };
      await composeMutation.mutateAsync(dto);
      toast.success("Draft saved");
      onSuccess?.();
      if (mode === "page") router.push("/email");
    } catch {
      toast.error("Failed to save draft");
    }
  }, [
    accountId, getAllTo, showCc, ccRaw, showBcc, bccRaw, subject, bodyHtml,
    entityType, entityId, priority, trackOpens, trackClicks, composeMutation,
    onSuccess, mode, router,
  ]);

  const handleSchedule = useCallback(async () => {
    if (!scheduledAt) {
      toast.error("Please select a schedule date and time");
      return;
    }
    try {
      const dto: ComposeEmailDto = {
        accountId,
        to: getAllTo(),
        cc: showCc ? parseEmailAddresses(ccRaw) : undefined,
        bcc: showBcc ? parseEmailAddresses(bccRaw) : undefined,
        subject,
        bodyHtml,
        sendNow: false,
        scheduledAt: scheduledAt.toISOString(),
        entityType,
        entityId,
        priority,
        trackOpens,
        trackClicks,
      };
      await composeMutation.mutateAsync(dto);
      toast.success("Email scheduled");
      onSuccess?.();
      if (mode === "page") router.push("/email");
    } catch {
      toast.error("Failed to schedule email");
    }
  }, [
    scheduledAt, accountId, getAllTo, showCc, ccRaw, showBcc, bccRaw, subject,
    bodyHtml, entityType, entityId, priority, trackOpens, trackClicks,
    composeMutation, onSuccess, mode, router,
  ]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    if (mode === "page") router.push("/email");
  }, [onCancel, mode, router]);

  // ── Account options ──
  const accountOptions = useMemo(
    () =>
      accounts.map((acc) => ({
        label: acc.displayName ? `${acc.displayName} (${acc.emailAddress})` : acc.emailAddress,
        value: acc.id,
      })),
    [accounts],
  );

  if (accountsLoading) return <LoadingSpinner />;

  // ── Render ──
  return (
    <div style={{ padding: mode === "page" ? 24 : 0 }}>
      {mode === "page" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Button variant="ghost" onClick={handleCancel}>
            <Icon name="arrow-left" size={16} />
          </Button>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1e293b" }}>
            {replyTo ? `${replyTo.type === "FORWARD" ? "Forward" : "Reply"}` : "Compose Email"}
          </h1>
        </div>
      )}

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Sender Account */}
        <div style={{ marginBottom: 16 }}>
          <SelectInput
            label="From"
            leftIcon={<Icon name="user" size={16} />}
            options={accountOptions}
            value={accountId}
            onChange={(v) => setAccountId(v as string)}
          />
        </div>

        {/* To Field with Tags */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "6px 10px",
              minHeight: 42,
              background: "#fff",
            }}
          >
            <Icon name="users" size={16} style={{ color: "#9ca3af", flexShrink: 0 }} />
            {toTags.map((email) => (
              <Badge key={email} variant="primary">
                {email}
                <span
                  onClick={() => removeToTag(email)}
                  style={{ marginLeft: 4, cursor: "pointer", fontWeight: 700 }}
                >
                  x
                </span>
              </Badge>
            ))}
            <input
              type="text"
              value={toRaw}
              onChange={(e) => setToRaw(e.target.value)}
              onKeyDown={handleToKeyDown}
              onBlur={() => {
                if (toRaw.trim()) {
                  const emails = toRaw.split(",").map((s) => s.trim()).filter(Boolean);
                  setToTags((prev) => [...prev, ...emails.filter((em) => !prev.includes(em))]);
                  setToRaw("");
                }
              }}
              placeholder={toTags.length === 0 ? "To (comma-separated)" : ""}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                minWidth: 120,
                fontSize: 14,
                background: "transparent",
              }}
            />
            <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
              {!showCc && (
                <span
                  onClick={() => setShowCc(true)}
                  style={{ fontSize: 12, color: "#6366f1", cursor: "pointer", fontWeight: 500 }}
                >
                  CC
                </span>
              )}
              {!showBcc && (
                <span
                  onClick={() => setShowBcc(true)}
                  style={{ fontSize: 12, color: "#6366f1", cursor: "pointer", fontWeight: 500 }}
                >
                  BCC
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CC Field */}
        {showCc && (
          <div style={{ marginBottom: 16 }}>
            <Input
              label="CC"
              leftIcon={<Icon name="users" size={16} />}
              value={ccRaw}
              onChange={(v) => setCcRaw(v)}
              placeholder="CC (comma-separated)"
            />
          </div>
        )}

        {/* BCC Field */}
        {showBcc && (
          <div style={{ marginBottom: 16 }}>
            <Input
              label="BCC"
              leftIcon={<Icon name="users" size={16} />}
              value={bccRaw}
              onChange={(v) => setBccRaw(v)}
              placeholder="BCC (comma-separated)"
            />
          </div>
        )}

        {/* Subject */}
        <div style={{ marginBottom: 16 }}>
          <Input
            label="Subject"
            leftIcon={<Icon name="type" size={16} />}
            value={subject}
            onChange={(v) => setSubject(v)}
          />
        </div>

        {/* Priority */}
        <div style={{ marginBottom: 16 }}>
          <SelectInput
            label="Priority"
            leftIcon={<Icon name="flag" size={16} />}
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(v) => setPriority(v as EmailPriority)}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 16 }}>
          <RichTextEditor
            label="Body"
            value={bodyHtml}
            onChange={(html) => setBodyHtml(html)}
          />
        </div>

        {/* Tracking Options */}
        <div style={{ display: "flex", gap: 24, marginBottom: 16, alignItems: "center" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#4b5563",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={trackOpens}
              onChange={(e) => setTrackOpens(e.target.checked)}
              style={{ accentColor: "#6366f1" }}
            />
            <Icon name="eye" size={14} />
            Track opens
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#4b5563",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={trackClicks}
              onChange={(e) => setTrackClicks(e.target.checked)}
              style={{ accentColor: "#6366f1" }}
            />
            <Icon name="mouse-pointer" size={14} />
            Track clicks
          </label>
        </div>

        {/* Schedule Toggle */}
        <div style={{ marginBottom: 16 }}>
          <span
            onClick={() => setShowSchedule(!showSchedule)}
            style={{
              fontSize: 13,
              color: "#6366f1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="clock" size={14} />
            {showSchedule ? "Hide schedule" : "Schedule for later"}
          </span>
          {showSchedule && (
            <div style={{ marginTop: 12 }}>
              <DatePicker
                label="Schedule At"
                value={scheduledAt}
                onChange={(v) => setScheduledAt(v)}
              />
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingTop: 16,
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <Button variant="primary" onClick={handleSendNow} disabled={isSending}>
            <Icon name="send" size={16} />
            {isSending ? "Sending..." : "Send Now"}
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSending}>
            <Icon name="save" size={16} />
            Save Draft
          </Button>
          {showSchedule && scheduledAt && (
            <Button variant="ghost" onClick={handleSchedule} disabled={isSending}>
              <Icon name="clock" size={16} />
              Schedule
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
