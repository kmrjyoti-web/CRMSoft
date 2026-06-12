"use client";

import { useState, useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/ui";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import {
  useInitiateVerification,
  useVerifyOtp,
  useResendVerification,
  useVerificationHistory,
} from "../hooks/useEntityVerification";
import type {
  EntityVerificationChannel,
  EntityVerificationMode,
  InitiateResult,
} from "../types/entity-verification.types";

type Step =
  | "choose-mode"
  | "choose-channel"
  | "enter-otp"
  | "otp-success"
  | "link-sent"
  | "already-verified";

interface VerifyModalProps {
  entityType: string;
  entityId: string;
  entityName: string;
  entityEmail?: string | null;
  entityPhone?: string | null;
  currentStatus: string;
  onClose: () => void;
  onVerified?: () => void;
}

// OTP input component — 6 individual boxes
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    onChange(next.join("").trim());
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text) {
      onChange(text);
      e.preventDefault();
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 44,
            height: 52,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 600,
            border: "2px solid #e5e7eb",
            borderRadius: 8,
            outline: "none",
            caretColor: "transparent",
            background: d ? "#f0f9ff" : "#fff",
            borderColor: d ? "#0ea5e9" : "#e5e7eb",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0ea5e9")}
          onBlur={(e) =>
            (e.target.style.borderColor = digits[i] ? "#0ea5e9" : "#e5e7eb")
          }
        />
      ))}
    </div>
  );
}

// Countdown timer
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

export function VerifyModal({
  entityType,
  entityId,
  entityName,
  entityEmail,
  entityPhone,
  currentStatus,
  onClose,
  onVerified,
}: VerifyModalProps) {
  const [step, setStep] = useState<Step>(
    currentStatus === "VERIFIED" ? "already-verified" : "choose-mode"
  );
  const [mode, setMode] = useState<EntityVerificationMode>("OTP");
  const [channel, setChannel] = useState<EntityVerificationChannel>("EMAIL");
  const [initiateResult, setInitiateResult] = useState<InitiateResult | null>(
    null
  );
  const [otp, setOtp] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiate = useInitiateVerification();
  const verifyOtp = useVerifyOtp();
  const resend = useResendVerification();
  const { data: history } = useVerificationHistory(entityType, entityId);

  const channelOptions: {
    value: EntityVerificationChannel;
    label: string;
    icon: string;
    detail: string | null;
  }[] = [
    { value: "EMAIL", label: "Email", icon: "mail", detail: entityEmail ?? null },
    {
      value: "MOBILE_SMS",
      label: "Mobile SMS",
      icon: "smartphone",
      detail: entityPhone ?? null,
    },
    {
      value: "WHATSAPP",
      label: "WhatsApp",
      icon: "message-circle",
      detail: entityPhone ?? null,
    },
  ].filter((o) => o.detail) as { value: EntityVerificationChannel; label: string; icon: string; detail: string }[];

  const handleSendOtp = async () => {
    setError(null);
    try {
      const result = await initiate.mutateAsync({
        entityType,
        entityId,
        mode: "OTP",
        channel,
      });
      setInitiateResult(result);
      setOtp("");
      setOtpExpired(false);
      setStep("enter-otp");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to send OTP"
      );
    }
  };

  const handleSendLink = async () => {
    setError(null);
    try {
      const result = await initiate.mutateAsync({
        entityType,
        entityId,
        mode: "LINK",
        channel: "EMAIL",
      });
      setInitiateResult(result);
      setStep("link-sent");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to send link"
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6 || !initiateResult?.recordId) return;
    setError(null);
    try {
      await verifyOtp.mutateAsync({ recordId: initiateResult.recordId, otp });
      setStep("otp-success");
      onVerified?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(
        err?.response?.data?.message ?? err?.message ?? "Invalid OTP"
      );
    }
  };

  const handleResend = async () => {
    if (!initiateResult?.recordId) return;
    setError(null);
    setOtp("");
    setOtpExpired(false);
    try {
      const result = await resend.mutateAsync(initiateResult.recordId);
      setInitiateResult(result);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to resend"
      );
    }
  };

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
          width: 480,
          maxWidth: "100%",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
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
            }}
          >
            <Icon name="shield-check" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              Verify: {entityName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 2,
              }}
            >
              <VerificationStatusBadge status={currentStatus} />
            </div>
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
          {/* Already verified */}
          {step === "already-verified" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>&#x2705;</div>
              <div
                style={{ fontWeight: 600, fontSize: 16, color: "#15803d" }}
              >
                {entityName} is already verified!
              </div>
              <button
                onClick={onClose}
                style={{
                  marginTop: 20,
                  padding: "9px 24px",
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

          {/* Choose mode */}
          {step === "choose-mode" && (
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: "#374151",
                  marginBottom: 16,
                  fontWeight: 500,
                }}
              >
                How would you like to verify?
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  {
                    value: "OTP" as const,
                    icon: "zap",
                    title: "Verify Now",
                    desc: "Send OTP and verify on call right now",
                  },
                  {
                    value: "LINK" as const,
                    icon: "send",
                    title: "Send Link",
                    desc: "Send verification link via Email & WhatsApp. Valid 24 hours.",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    style={{
                      padding: 16,
                      border: `2px solid ${mode === opt.value ? "#0ea5e9" : "#e5e7eb"}`,
                      borderRadius: 12,
                      background: mode === opt.value ? "#f0f9ff" : "white",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Icon name={opt.icon as IconName} size={18} />
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {opt.title}
                      </span>
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}
                    >
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    if (mode === "OTP") setStep("choose-channel");
                    else handleSendLink();
                  }}
                  disabled={initiate.isPending}
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
                    opacity: initiate.isPending ? 0.7 : 1,
                  }}
                >
                  {initiate.isPending
                    ? "Sending\u2026"
                    : mode === "OTP"
                    ? "Next \u2192"
                    : "Send Verification Link"}
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 16px",
                    background: "none",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Choose channel (OTP mode) */}
          {step === "choose-channel" && mode === "OTP" && (
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: "#374151",
                  marginBottom: 16,
                  fontWeight: 500,
                }}
              >
                Send OTP via:
              </div>
              {channelOptions.length === 0 && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: 13,
                    padding: "12px 0",
                  }}
                >
                  No contact details available. Add email or phone to this
                  entity first.
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {channelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setChannel(opt.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      border: `2px solid ${channel === opt.value ? "#0ea5e9" : "#e5e7eb"}`,
                      borderRadius: 10,
                      background:
                        channel === opt.value ? "#f0f9ff" : "white",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Icon name={opt.icon as IconName} size={18} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {opt.detail}
                      </div>
                    </div>
                    {channel === opt.value && (
                      <span style={{ marginLeft: "auto", color: "#0ea5e9" }}>
                        &#x2713;
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {error && (
                <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>
                  {error}
                </div>
              )}
              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep("choose-mode")}
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
                  onClick={handleSendOtp}
                  disabled={initiate.isPending || channelOptions.length === 0}
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
                    opacity: initiate.isPending ? 0.7 : 1,
                  }}
                >
                  {initiate.isPending ? "Sending\u2026" : "Send OTP"}
                </button>
              </div>
            </div>
          )}

          {/* Enter OTP */}
          {step === "enter-otp" && initiateResult && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Enter OTP sent to
                </div>
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
                    }}
                  >
                    Dev OTP: <strong>{initiateResult.devOtp}</strong>
                  </div>
                )}
              </div>

              <OtpInput value={otp} onChange={setOtp} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                {initiateResult.otpExpiresAt ? (
                  <Countdown
                    expiresAt={initiateResult.otpExpiresAt}
                    onExpire={() => setOtpExpired(true)}
                  />
                ) : (
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    Expires in {initiateResult.expiresIn}
                  </span>
                )}
                <button
                  onClick={handleResend}
                  disabled={resend.isPending}
                  style={{
                    fontSize: 12,
                    color: "#0ea5e9",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Resend OTP
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

              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStep("choose-channel")}
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
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 6 || verifyOtp.isPending || otpExpired}
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
                      otp.length < 6 || verifyOtp.isPending || otpExpired
                        ? 0.5
                        : 1,
                  }}
                >
                  {verifyOtp.isPending ? "Verifying\u2026" : "Verify OTP"}
                </button>
              </div>
            </div>
          )}

          {/* OTP success */}
          {step === "otp-success" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>&#x2705;</div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#15803d",
                  marginBottom: 4,
                }}
              >
                Verified Successfully!
              </div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                {entityName} verified via {channel} OTP
              </div>
              <button
                onClick={onClose}
                style={{
                  marginTop: 20,
                  padding: "9px 24px",
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

          {/* Link sent */}
          {step === "link-sent" && initiateResult && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>&#x1F4E8;</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  Verification Link Sent!
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
                {initiateResult.sentVia?.includes("EMAIL") && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <Icon name="mail" size={14} />
                    <span>Email sent</span>
                  </div>
                )}
                {initiateResult.sentVia?.includes("WHATSAPP") && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <Icon name="message-circle" size={14} />
                    <span>WhatsApp sent</span>
                  </div>
                )}
                {initiateResult.expiresAt && (
                  <div
                    style={{
                      marginTop: 8,
                      color: "#6b7280",
                      fontSize: 12,
                    }}
                  >
                    Link expires:{" "}
                    {new Date(initiateResult.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>
              {error && (
                <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>
                  {error}
                </div>
              )}
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
                Close
              </button>
            </div>
          )}

          {/* Verification history */}
          {history &&
            history.length > 0 &&
            !["otp-success", "link-sent", "already-verified"].includes(
              step
            ) && (
              <div
                style={{
                  marginTop: 24,
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#9ca3af",
                    marginBottom: 8,
                  }}
                >
                  Verification History
                </div>
                <div style={{ maxHeight: 120, overflowY: "auto" }}>
                  {history.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "5px 0",
                        fontSize: 12,
                        borderBottom: "1px solid #f9fafb",
                      }}
                    >
                      <span style={{ color: "#4b5563" }}>
                        {r.mode} via {r.channel}
                      </span>
                      <span
                        style={{
                          color:
                            r.status === "VERIFIED"
                              ? "#15803d"
                              : r.status === "FAILED" ||
                                r.status === "REJECTED"
                              ? "#b91c1c"
                              : "#92400e",
                        }}
                      >
                        {r.status}
                      </span>
                      <span style={{ color: "#9ca3af" }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
