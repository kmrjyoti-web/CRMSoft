"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";
import type { FeedOffer } from "./FeedOfferCard";

interface OrderFormModalProps {
  offer: FeedOffer | null;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  "Bank Transfer (NEFT/RTGS)",
  "UPI / QR Code",
  "Cheque / DD",
  "Credit (30 days)",
  "Cash on Delivery",
];
const STATES = [
  "Maharashtra",
  "Gujarat",
  "Karnataka",
  "Tamil Nadu",
  "Delhi",
  "Uttar Pradesh",
  "Rajasthan",
  "West Bengal",
];

export function OrderFormModal({ offer, onClose }: OrderFormModalProps) {
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!offer) return null;

  const total = offer.offerPrice * qty;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !city || !state || !pincode) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 1000,
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(520px, calc(100vw - 32px))",
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
                backgroundColor: "var(--color-success-light, #dcfce7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Icon name="check" size={28} color="var(--color-success, #22c55e)" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              Order Placed!
            </div>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
              Your order for <strong>{offer.productName}</strong> has been submitted. The vendor will
              contact you within 24 hours.
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
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Place Order</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{offer.vendorName}</div>
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

            {/* Product summary */}
            <div
              style={{
                backgroundColor: "var(--color-primary-50, #eef7fa)",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                  {offer.productName}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  ₹{offer.offerPrice.toLocaleString("en-IN")} per unit · {offer.discountPercent}% off
                </div>
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--color-primary, #1e5f74)",
                }}
              >
                ₹{total.toLocaleString("en-IN")}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Quantity */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Quantity *
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: "1.5px solid #e2e8f0",
                      background: "#f8fafc",
                      cursor: "pointer",
                      fontSize: 18,
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: 80,
                      textAlign: "center",
                      padding: "8px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: "1.5px solid #e2e8f0",
                      background: "#f8fafc",
                      cursor: "pointer",
                      fontSize: 18,
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Total:{" "}
                    <strong style={{ color: "var(--color-primary, #1e5f74)" }}>
                      ₹{total.toLocaleString("en-IN")}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Delivery address */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Delivery Address *
                </label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot/Street/Building, Area..."
                  rows={2}
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

              {/* City / State / Pincode row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 100px",
                  gap: 10,
                  marginBottom: 16,
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
                    City *
                  </label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
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
                    State *
                  </label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 13,
                      backgroundColor: "#fff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Select</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
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
                    Pincode *
                  </label>
                  <input
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    maxLength={6}
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

              {/* Payment method */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Preferred Payment *
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m}
                        checked={payment === m}
                        onChange={() => setPayment(m)}
                      />
                      {m}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requirements, preferred delivery time, etc."
                  rows={2}
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
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Icon name="shopping-cart" size={15} color="#fff" />
                      Confirm Order — ₹{total.toLocaleString("en-IN")}
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
