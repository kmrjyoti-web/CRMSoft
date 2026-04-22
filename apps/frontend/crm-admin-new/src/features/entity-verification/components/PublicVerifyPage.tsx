"use client";
import { useEffect, useState } from "react";
import { publicVerificationService } from "../services/entity-verification.service";
import type { VerificationPageData } from "../types/entity-verification.types";

const REJECTION_REASONS = [
  "Wrong email",
  "Wrong phone",
  "Wrong address",
  "Not me",
  "Wrong name",
  "Other",
];

export function PublicVerifyPage({ token }: { token: string }) {
  const [data, setData] = useState<VerificationPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<
    "confirm" | "reject-form" | "done-verified" | "done-rejected"
  >("confirm");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    publicVerificationService
      .getPage(token)
      .then((d: VerificationPageData) => {
        setData(d);
        if (d?.expiresAt) {
          const diff = Math.max(
            0,
            Math.floor(
              (new Date(d.expiresAt).getTime() - Date.now()) / 1000
            )
          );
          setTimeLeft(diff);
        }
      })
      .catch(() => setData({ expired: true }))
      .finally(() => setLoading(false));
  }, [token]);

  // Countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setTimeout(
      () => setTimeLeft((v) => Math.max(0, (v ?? 0) - 1)),
      1000
    );
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await publicVerificationService.confirm(token);
      setStep("done-verified");
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message ?? "Failed to confirm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason =
      selectedReason === "Other" ? rejectionReason : selectedReason;
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await publicVerificationService.reject(token, reason);
      setStep("done-rejected");
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message ?? "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  };

  if (loading)
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div
            style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}
          >
            Loading\u2026
          </div>
        </div>
      </div>
    );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{ fontSize: 22, fontWeight: 800, color: "#ff9d2b" }}
          >
            CRM
            <span style={{ color: "#1e293b", fontWeight: 500 }}>Soft</span>
          </div>
        </div>

        {/* Expired */}
        {data?.expired && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#x23F0;</div>
            <h2
              style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}
            >
              Link Expired
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.5,
                marginTop: 8,
              }}
            >
              This verification link has expired. Please contact the company
              for a new verification link.
            </p>
          </div>
        )}

        {/* Already verified */}
        {data?.alreadyVerified && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#x2705;</div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#15803d",
              }}
            >
              Already Verified
            </h2>
            <p
              style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}
            >
              {data.entityName ?? "Your details"} have already been
              verified. Thank you!
            </p>
          </div>
        )}

        {/* Main confirm step */}
        {!data?.expired &&
          !data?.alreadyVerified &&
          data?.details &&
          step === "confirm" && (
            <>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 4,
                }}
              >
                Verify Your Details
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                Hello <strong>{data.entityName}</strong>! Please review your
                details and confirm they are correct.
              </p>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 20,
                  fontSize: 14,
                }}
              >
                {(
                  [
                    ["Name", data.details.name],
                    ["Email", data.details.email],
                    ["Mobile", data.details.phone],
                    ["Organization", data.details.organization],
                    ["Address", data.details.address],
                    ["GSTIN", data.details.gstin],
                  ] as [string, string | null | undefined][]
                )
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "6px 0",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          color: "#9ca3af",
                          minWidth: 90,
                          fontSize: 12,
                        }}
                      >
                        {label}:
                      </span>
                      <span
                        style={{ color: "#1e293b", fontWeight: 500 }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
              </div>

              {timeLeft !== null && timeLeft > 0 && (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 16,
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  &#x23F1; This link expires in:{" "}
                  <strong>{formatTime(timeLeft)}</strong>
                </div>
              )}

              {error && (
                <div
                  style={{
                    color: "#ef4444",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  style={{
                    padding: "12px 16px",
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  &#x2705; Yes, Confirm
                </button>
                <button
                  onClick={() => setStep("reject-form")}
                  disabled={submitting}
                  style={{
                    padding: "12px 16px",
                    background: "white",
                    color: "#ef4444",
                    border: "2px solid #fee2e2",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  &#x274C; Report Issue
                </button>
              </div>
            </>
          )}

        {/* Reject form */}
        {step === "reject-form" && (
          <>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: 4,
              }}
            >
              Report an Issue
            </h2>
            <p
              style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}
            >
              What is incorrect?
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {REJECTION_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  style={{
                    padding: "6px 14px",
                    border: `2px solid ${selectedReason === r ? "#ef4444" : "#e5e7eb"}`,
                    borderRadius: 20,
                    background: selectedReason === r ? "#fee2e2" : "white",
                    cursor: "pointer",
                    fontSize: 13,
                    color:
                      selectedReason === r ? "#b91c1c" : "#374151",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            {selectedReason === "Other" && (
              <textarea
                placeholder="Describe the issue\u2026"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 13,
                  resize: "vertical",
                  minHeight: 80,
                  boxSizing: "border-box",
                }}
              />
            )}
            {error && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: 13,
                  margin: "8px 0",
                }}
              >
                {error}
              </div>
            )}
            <div
              style={{ display: "flex", gap: 8, marginTop: 16 }}
            >
              <button
                onClick={() => setStep("confirm")}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: "white",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                &#x2190; Back
              </button>
              <button
                onClick={handleReject}
                disabled={submitting || !selectedReason}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: submitting || !selectedReason ? 0.6 : 1,
                }}
              >
                {submitting ? "Submitting\u2026" : "Submit Report"}
              </button>
            </div>
          </>
        )}

        {/* Done verified */}
        {step === "done-verified" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#x2705;</div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#15803d",
              }}
            >
              Thank you!
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.5,
                marginTop: 8,
              }}
            >
              Your details have been verified successfully. You can close
              this page.
            </p>
          </div>
        )}

        {/* Done rejected */}
        {step === "done-rejected" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#x1F4DD;</div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Report Received
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.5,
                marginTop: 8,
              }}
            >
              Your concern has been noted. Our team will contact you to
              resolve the issue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
