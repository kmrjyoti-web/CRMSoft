"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";

export interface EnquiryTarget {
  id: string;
  name: string; // product/offer name or requirement title
  vendorOrBuyerName: string;
  type: "offer" | "requirement" | "product";
}

interface EnquiryFormModalProps {
  target: EnquiryTarget | null;
  onClose: () => void;
}

export function EnquiryFormModal({ target, onClose }: EnquiryFormModalProps) {
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reqQty, setReqQty] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!target) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message || !phone) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  }

  const title = target.type === "requirement" ? "Submit Quote / Interest" : "Send Enquiry";
  const placeholder =
    target.type === "requirement"
      ? "Describe your capabilities, available quantity, and pricing..."
      : "What would you like to know? Include specific requirements...";

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 1000,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(480px, calc(100vw - 32px))",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          zIndex: 1001,
          padding: 24,
        }}
      >
        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "var(--color-primary-50, #eef7fa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Icon name="send" size={28} color="var(--color-primary, #1e5f74)" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              Enquiry Sent!
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
              Your enquiry for <strong>{target.name}</strong> has been sent to{" "}
              <strong>{target.vendorOrBuyerName}</strong>. Expect a response within 1–2 business
              days.
            </div>
            <button
              onClick={onClose}
              style={{
                padding: "10px 32px",
                backgroundColor: "var(--color-primary, #1e5f74)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{title}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {target.vendorOrBuyerName}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="x" size={14} color="#64748b" />
              </button>
            </div>

            {/* Target name badge */}
            <div
              style={{
                backgroundColor: "var(--color-primary-50, #eef7fa)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon
                name={target.type === "requirement" ? "search" : "tag"}
                size={14}
                color="var(--color-primary, #1e5f74)"
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{target.name}</span>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Message */}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Message *
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={placeholder}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#1e293b",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Quantity (for requirement enquiry) */}
              {target.type === "requirement" && (
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Quantity You Can Supply
                  </label>
                  <input
                    value={reqQty}
                    onChange={(e) => setReqQty(e.target.value)}
                    placeholder="e.g., 2000 units/month"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              {/* Contact details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Phone *
                  </label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "11px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 8,
                    background: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: "11px",
                    border: "none",
                    borderRadius: 8,
                    backgroundColor: submitting
                      ? "#94a3b8"
                      : "var(--color-primary, #1e5f74)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {submitting ? (
                    <>
                      <Icon name="loader" size={15} color="#fff" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icon name="send" size={15} color="#fff" />
                      Send Enquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
