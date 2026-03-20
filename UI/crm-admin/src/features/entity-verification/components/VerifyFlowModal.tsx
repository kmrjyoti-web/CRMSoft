"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@/components/ui";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import { OtpInput } from "./OtpInput";
import { VerificationHistoryPanel } from "./VerificationHistoryPanel";
import {
  useInitiateVerification,
  useVerifyOtp,
  useResendVerification,
  useResetVerification,
} from "../hooks/useEntityVerification";
import type {
  EntityVerificationChannel,
  InitiateResult,
} from "../types/entity-verification.types";

// ── Types ────────────────────────────────────────────────

type VerifyFlowStep =
  | "setup"
  | "enter-otp"
  | "enter-otp-both"
  | "link-sent"
  | "success";

type VerifyMethod =
  | "mobile-otp"
  | "email-otp"
  | "both-otp"
  | "send-link";

export interface VerifyFlowEntityData {
  // For CONTACT / RAW_CONTACT
  firstName?: string;
  lastName?: string;
  // For ORGANIZATION
  name?: string;
  // Shared
  email?: string | null;
  phone?: string | null;
}

export interface VerifyFlowModalProps {
  entityType: "CONTACT" | "RAW_CONTACT" | "ORGANIZATION";
  entityId: string;
  entityName: string;
  entityData: VerifyFlowEntityData;
  currentStatus?: string;
  onClose: () => void;
  onVerified?: () => void;
  /** Called before sending verification — saves updated email/phone to DB first */
  onSaveBeforeVerify?: (data: { email?: string; phone?: string }) => Promise<void>;
}

// ── Countdown Timer ─────────────────────────────────────

function Countdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(
      () => setRemaining((r) => Math.max(0, r - 1)),
      1000
    );
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return (
    <span
      style={{
        color: remaining < 60 ? "#ef4444" : "#6b7280",
        fontWeight: 500,
        fontSize: 13,
      }}
    >
      &#x23F1; {m}:{s.toString().padStart(2, "0")} remaining
    </span>
  );
}

// ── Simple labeled input ────────────────────────────────

function LabeledField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 500,
          color: "#6b7280",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          fontSize: 14,
          color: "#111827",
          outline: "none",
          boxSizing: "border-box",
          background: "#fff",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#0ea5e9")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
}

// ── Main component ───────────────────────────────────────

export function VerifyFlowModal({
  entityType,
  entityId,
  entityName,
  entityData,
  currentStatus,
  onClose,
  onVerified,
  onSaveBeforeVerify,
}: VerifyFlowModalProps) {
  // ── Editable fields state ──────────────────────────────
  const [firstName, setFirstName] = useState(entityData.firstName ?? "");
  const [lastName, setLastName] = useState(entityData.lastName ?? "");
  const [orgName, setOrgName] = useState(entityData.name ?? "");
  const [email, setEmail] = useState(entityData.email ?? "");
  const [phone, setPhone] = useState(entityData.phone ?? "");

  // ── Flow state ─────────────────────────────────────────
  const [step, setStep] = useState<VerifyFlowStep>("setup");
  const [method, setMethod] = useState<VerifyMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  // OTP step state
  const [otp, setOtp] = useState("");
  const [otp2, setOtp2] = useState(""); // second OTP for "both"
  const [otpExpired, setOtpExpired] = useState(false);
  const [otp2Expired, setOtp2Expired] = useState(false);
  const [initiateResult, setInitiateResult] = useState<InitiateResult | null>(null);
  const [initiateResult2, setInitiateResult2] = useState<InitiateResult | null>(null);

  // ── Hooks ──────────────────────────────────────────────
  const initiate = useInitiateVerification();
  const verifyOtpMut = useVerifyOtp();
  const resend = useResendVerification();
  const resetMut = useResetVerification();

  // ── Derived: available methods ─────────────────────────
  const hasPhone = phone.trim().length > 0;
  const hasEmail = email.trim().length > 0;

  // default to first available method
  useEffect(() => {
    if (method === null) {
      if (hasPhone) setMethod("mobile-otp");
      else if (hasEmail) setMethod("email-otp");
      else setMethod("send-link");
    }
  }, [hasPhone, hasEmail, method]);

  // ── Handlers ──────────────────────────────────────────
  const sendingRef = useRef(false);

  const handleSendVerification = useCallback(async () => {
    // Prevent double-click race condition
    if (sendingRef.current || initiate.isPending) return;
    sendingRef.current = true;
    setError(null);

    // If email/phone was edited, save to DB first
    if (onSaveBeforeVerify) {
      const emailChanged = email.trim() !== (entityData.email ?? "").trim();
      const phoneChanged = phone.trim() !== (entityData.phone ?? "").trim();
      if (emailChanged || phoneChanged) {
        try {
          await onSaveBeforeVerify({
            ...(emailChanged ? { email: email.trim() } : {}),
            ...(phoneChanged ? { phone: phone.trim() } : {}),
          });
        } catch {
          setError("Failed to save contact details. Please try again.");
          return;
        }
      }
    }

    try {
      if (method === "mobile-otp") {
        const result = await initiate.mutateAsync({
          entityType,
          entityId,
          mode: "OTP",
          channel: "MOBILE_SMS",
        });
        setInitiateResult(result);
        setOtp("");
        setOtpExpired(false);
        setStep("enter-otp");
      } else if (method === "email-otp") {
        const result = await initiate.mutateAsync({
          entityType,
          entityId,
          mode: "OTP",
          channel: "EMAIL",
        });
        setInitiateResult(result);
        setOtp("");
        setOtpExpired(false);
        setStep("enter-otp");
      } else if (method === "both-otp") {
        const r1 = await initiate.mutateAsync({
          entityType,
          entityId,
          mode: "OTP",
          channel: "MOBILE_SMS",
        });
        const r2 = await initiate.mutateAsync({
          entityType,
          entityId,
          mode: "OTP",
          channel: "EMAIL",
        });
        setInitiateResult(r1);
        setInitiateResult2(r2);
        setOtp("");
        setOtp2("");
        setOtpExpired(false);
        setOtp2Expired(false);
        setStep("enter-otp-both");
      } else if (method === "send-link") {
        const channel: EntityVerificationChannel = hasEmail ? "EMAIL" : "WHATSAPP";
        const result = await initiate.mutateAsync({
          entityType,
          entityId,
          mode: "LINK",
          channel,
        });
        setInitiateResult(result);
        setStep("link-sent");
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to send verification");
    } finally {
      sendingRef.current = false;
    }
  }, [method, initiate, entityType, entityId, hasEmail]);

  const handleVerifyOtp = useCallback(async () => {
    if (!initiateResult?.recordId) return;
    setError(null);
    try {
      await verifyOtpMut.mutateAsync({ recordId: initiateResult.recordId, otp });
      setStep("success");
      onVerified?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? "Invalid OTP");
    }
  }, [initiateResult, otp, verifyOtpMut, onVerified]);

  const handleVerifyBothOtp = useCallback(async () => {
    if (!initiateResult?.recordId) return;
    setError(null);
    try {
      await verifyOtpMut.mutateAsync({ recordId: initiateResult.recordId, otp });
      if (initiateResult2?.recordId && otp2.length === 6) {
        await verifyOtpMut.mutateAsync({ recordId: initiateResult2.recordId, otp: otp2 });
      }
      setStep("success");
      onVerified?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? "Invalid OTP");
    }
  }, [initiateResult, initiateResult2, otp, otp2, verifyOtpMut, onVerified]);

  const handleResend = useCallback(async () => {
    if (!initiateResult?.recordId) return;
    setError(null);
    setOtp("");
    setOtpExpired(false);
    try {
      const result = await resend.mutateAsync(initiateResult.recordId);
      setInitiateResult(result);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to resend");
    }
  }, [initiateResult, resend]);

  const handleReset = useCallback(async () => {
    setError(null);
    try {
      await resetMut.mutateAsync({ entityType, entityId });
      setStep("setup");
      setInitiateResult(null);
      setInitiateResult2(null);
      setOtp("");
      setOtp2("");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to reset");
    }
  }, [resetMut, entityType, entityId]);

  // ── Render ─────────────────────────────────────────────

  const isOrg = entityType === "ORGANIZATION";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: 520,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#f0f9ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="shield-check" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              Verify {entityName}
            </div>
            {currentStatus && (
              <div style={{ marginTop: 2 }}>
                <VerificationStatusBadge status={currentStatus} />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: 4,
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div style={{ padding: 24 }}>

          {/* ── Step 1: Setup ─────────────────────────────── */}
          {step === "setup" && (
            <div>
              {/* Section: Review & update contact details */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#9ca3af",
                  marginBottom: 12,
                }}
              >
                Review &amp; update contact details before sending verification
              </div>

              {isOrg ? (
                <>
                  <LabeledField label="Name" value={orgName} onChange={setOrgName} />
                  <LabeledField label="Email" value={email} onChange={setEmail} type="email" />
                  <LabeledField label="Phone" value={phone} onChange={setPhone} type="tel" />
                </>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <LabeledField label="First Name" value={firstName} onChange={setFirstName} />
                    <LabeledField label="Last Name" value={lastName} onChange={setLastName} />
                  </div>
                  <LabeledField label="Email" value={email} onChange={setEmail} type="email" />
                  <LabeledField label="Mobile" value={phone} onChange={setPhone} type="tel" />
                </>
              )}

              {/* Section: Choose verification method */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#9ca3af",
                  marginTop: 20,
                  marginBottom: 12,
                }}
              >
                Choose verification method
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {hasPhone && (
                  <MethodCard
                    icon="smartphone"
                    title="Mobile OTP"
                    desc={`Send OTP to ${phone}`}
                    selected={method === "mobile-otp"}
                    onSelect={() => setMethod("mobile-otp")}
                  />
                )}
                {hasEmail && (
                  <MethodCard
                    icon="mail"
                    title="Email OTP"
                    desc={`Send OTP to ${email}`}
                    selected={method === "email-otp"}
                    onSelect={() => setMethod("email-otp")}
                  />
                )}
                {(hasEmail || hasPhone) && (
                  <MethodCard
                    icon="link"
                    title="Send Link"
                    desc="Send verification link via email/WhatsApp"
                    selected={method === "send-link"}
                    onSelect={() => setMethod("send-link")}
                  />
                )}
                {hasPhone && hasEmail && (
                  <MethodCard
                    icon="zap"
                    title="Both (Mobile + Email OTP)"
                    desc="Send OTP to both mobile and email simultaneously"
                    selected={method === "both-otp"}
                    onSelect={() => setMethod("both-otp")}
                  />
                )}
              </div>

              {!hasEmail && !hasPhone && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#b91c1c",
                  }}
                >
                  Please add an email or phone number before sending verification.
                </div>
              )}

              {error && (
                <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>
                  {error}
                </div>
              )}

              {/* Previous attempts */}
              <VerificationHistoryPanel entityType={entityType} entityId={entityId} />

              {/* Reset previous verifications */}
              {(currentStatus === "PENDING" || currentStatus === "VERIFIED" || currentStatus === "REJECTED") && (
                <div style={{ marginTop: 12, textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetMut.isPending}
                    style={{
                      fontSize: 12,
                      color: "#ef4444",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {resetMut.isPending ? "Resetting\u2026" : "Reset all previous verification data"}
                  </button>
                </div>
              )}

              {/* Footer */}
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 16px",
                    background: "none",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#374151",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendVerification}
                  disabled={initiate.isPending || method === null || (!hasEmail && !hasPhone)}
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    background: "#0ea5e9",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    opacity: initiate.isPending || method === null || (!hasEmail && !hasPhone) ? 0.6 : 1,
                  }}
                >
                  {initiate.isPending ? "Sending\u2026" : "Send Verification"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2a: OTP Entry (single) ───────────────── */}
          {step === "enter-otp" && initiateResult && (
            <OtpEntryStep
              initiateResult={initiateResult}
              otp={otp}
              onOtpChange={setOtp}
              otpExpired={otpExpired}
              onExpire={() => setOtpExpired(true)}
              error={error}
              isPending={verifyOtpMut.isPending}
              isResending={resend.isPending}
              onVerify={handleVerifyOtp}
              onResend={handleResend}
              onBack={() => setStep("setup")}
            />
          )}

          {/* ── Step 2b: OTP Entry (both) ─────────────────── */}
          {step === "enter-otp-both" && initiateResult && initiateResult2 && (
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                OTPs sent to both mobile and email. Enter both to verify.
              </div>

              <div
                style={{
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon name="smartphone" size={14} />
                  Mobile OTP — sent to {initiateResult.sentTo}
                </div>
                <OtpInput value={otp} onChange={setOtp} devOtp={initiateResult.devOtp} />
                {initiateResult.otpExpiresAt && !otpExpired && (
                  <div style={{ textAlign: "center", marginTop: 6 }}>
                    <Countdown
                      expiresAt={initiateResult.otpExpiresAt}
                      onExpire={() => setOtpExpired(true)}
                    />
                  </div>
                )}
                {otpExpired && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "#b91c1c",
                      textAlign: "center",
                    }}
                  >
                    Expired
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon name="mail" size={14} />
                  Email OTP — sent to {initiateResult2.sentTo}
                </div>
                <OtpInput value={otp2} onChange={setOtp2} devOtp={initiateResult2.devOtp} />
                {initiateResult2.otpExpiresAt && !otp2Expired && (
                  <div style={{ textAlign: "center", marginTop: 6 }}>
                    <Countdown
                      expiresAt={initiateResult2.otpExpiresAt}
                      onExpire={() => setOtp2Expired(true)}
                    />
                  </div>
                )}
                {otp2Expired && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "#b91c1c",
                      textAlign: "center",
                    }}
                  >
                    Expired
                  </div>
                )}
              </div>

              {error && (
                <div style={{ marginTop: 8, color: "#ef4444", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => setStep("setup")}
                  style={{
                    padding: "10px 16px",
                    background: "none",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  &#x2190; Back
                </button>
                <button
                  onClick={handleVerifyBothOtp}
                  disabled={otp.length < 6 || otp2.length < 6 || verifyOtpMut.isPending || otpExpired || otp2Expired}
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    background: "#0ea5e9",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    opacity:
                      otp.length < 6 || otp2.length < 6 || verifyOtpMut.isPending || otpExpired || otp2Expired
                        ? 0.5
                        : 1,
                  }}
                >
                  {verifyOtpMut.isPending ? "Verifying\u2026" : "Verify Both OTPs"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2b: Link sent ──────────────────────────── */}
          {step === "link-sent" && initiateResult && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>&#x1F4E8;</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  Verification link sent!
                </div>
              </div>

              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 10,
                  padding: 16,
                  fontSize: 13,
                }}
              >
                {initiateResult.sentTo && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Icon name="send" size={14} />
                    <span>Sent to: <strong>{initiateResult.sentTo}</strong></span>
                  </div>
                )}
                {initiateResult.sentVia?.includes("EMAIL") && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <Icon name="mail" size={13} />
                    <span>Email sent</span>
                  </div>
                )}
                {initiateResult.sentVia?.includes("WHATSAPP") && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <Icon name="message-circle" size={13} />
                    <span>WhatsApp sent</span>
                  </div>
                )}
                {initiateResult.expiresAt && (
                  <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>
                    Link expires: {new Date(initiateResult.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: "10px 20px",
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Done
              </button>
            </div>
          )}

          {/* ── Step 3: Success ────────────────────────────── */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Icon name="check-circle" size={32} />
              </div>
              <div
                style={{ fontWeight: 700, fontSize: 18, color: "#15803d", marginBottom: 6 }}
              >
                Verified successfully!
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
                {entityName} has been verified.
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 32px",
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Method card ──────────────────────────────────────────

function MethodCard({
  icon,
  title,
  desc,
  selected,
  onSelect,
}: {
  icon: string;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        border: `2px solid ${selected ? "#0ea5e9" : "#e5e7eb"}`,
        borderRadius: 10,
        background: selected ? "#f0f9ff" : "white",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: selected ? "#e0f2fe" : "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <Icon name={icon as any} size={16} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{desc}</div>
      </div>
      {selected && (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#0ea5e9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          <Icon name="check" size={11} />
        </div>
      )}
    </button>
  );
}

// ── OTP Entry Step (extracted for reuse) ─────────────────

function OtpEntryStep({
  initiateResult,
  otp,
  onOtpChange,
  otpExpired,
  onExpire,
  error,
  isPending,
  isResending,
  onVerify,
  onResend,
  onBack,
}: {
  initiateResult: InitiateResult;
  otp: string;
  onOtpChange: (v: string) => void;
  otpExpired: boolean;
  onExpire: () => void;
  error: string | null;
  isPending: boolean;
  isResending: boolean;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#6b7280" }}>Enter OTP sent to</div>
        <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>
          {initiateResult.sentTo}
        </div>
        {initiateResult.devOtp && (
          <div
            style={{
              marginTop: 6,
              padding: "6px 12px",
              background: "#fef9c3",
              borderRadius: 6,
              fontSize: 12,
              color: "#92400e",
              display: "inline-block",
            }}
          >
            Dev OTP: <strong>{initiateResult.devOtp}</strong>
          </div>
        )}
      </div>

      <OtpInput value={otp} onChange={onOtpChange} devOtp={initiateResult.devOtp} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        {initiateResult.otpExpiresAt ? (
          <Countdown expiresAt={initiateResult.otpExpiresAt} onExpire={onExpire} />
        ) : (
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            Expires in {initiateResult.expiresIn}
          </span>
        )}
        <button
          onClick={onResend}
          disabled={isResending}
          style={{
            fontSize: 12,
            color: "#0ea5e9",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isResending ? "Resending\u2026" : "Resend OTP"}
        </button>
      </div>

      {otpExpired && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            background: "#fee2e2",
            borderRadius: 6,
            fontSize: 12,
            color: "#b91c1c",
          }}
        >
          OTP expired. Please resend.
        </div>
      )}

      {error && (
        <div style={{ marginTop: 8, color: "#ef4444", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button
          onClick={onBack}
          style={{
            padding: "10px 16px",
            background: "none",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          &#x2190; Back
        </button>
        <button
          onClick={onVerify}
          disabled={otp.length < 6 || isPending || otpExpired}
          style={{
            flex: 1,
            padding: "10px 20px",
            background: "#0ea5e9",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            opacity: otp.length < 6 || isPending || otpExpired ? 0.5 : 1,
          }}
        >
          {isPending ? "Verifying\u2026" : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}
