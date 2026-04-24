"use client";
import { useState, useEffect } from "react";
import { Icon } from "@/components/ui";

export interface FeedOffer {
  id: string;
  vendorName: string;
  vendorInitial: string;
  vendorColor?: string;
  title: string;
  productName: string;
  originalPrice: number;
  offerPrice: number;
  discountPercent: number;
  validUntil: string;
  remainingCount?: number;
  likeCount: number;
  shareCount: number;
  gradientFrom?: string;
  gradientTo?: string;
}

interface FeedOfferCardProps {
  offer: FeedOffer;
  onOrder: (id: string) => void;
  onEnquiry: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
}

interface CountdownResult {
  display: string;
  isUrgent: boolean;
  expired: boolean;
}

function useCountdown(validUntil: string): CountdownResult {
  const [result, setResult] = useState<CountdownResult>(() => computeCountdown(validUntil));

  useEffect(() => {
    const timer = setInterval(() => {
      setResult(computeCountdown(validUntil));
    }, 1000);
    return () => clearInterval(timer);
  }, [validUntil]);

  return result;
}

function computeCountdown(validUntil: string): CountdownResult {
  const target = new Date(validUntil).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { display: "Expired", isUrgent: true, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Show days + hours when >= 24h remain
  if (days >= 1) {
    const display = `${days}d ${hours}h`;
    return { display, isUrgent: false, expired: false };
  }

  // Show HH:MM:SS for < 24h
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const display = `${hh}:${mm}:${ss}`;
  const isUrgent = diff < 2 * 3600 * 1000; // < 2 hours
  return { display, isUrgent, expired: false };
}

export function FeedOfferCard({ offer, onOrder, onEnquiry, onLike, onShare }: FeedOfferCardProps) {
  const [liked, setLiked] = useState(false);
  const countdown = useCountdown(offer.validUntil);
  const gradFrom = offer.gradientFrom ?? "var(--color-primary, #1e5f74)";
  const gradTo = offer.gradientTo ?? "#0891b2";

  function handleLike() {
    setLiked((v) => !v);
    onLike(offer.id);
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: offer.vendorColor ?? "var(--color-success, #22c55e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          {offer.vendorInitial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{offer.vendorName}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Vendor</div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
            backgroundColor: "#fef3c7",
            color: "#d97706",
            border: "1px solid #fcd34d",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Sponsored Offer
        </span>
      </div>

      {/* Offer banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {offer.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!countdown.expired ? (
              <span
                style={{
                  fontSize: 12,
                  backgroundColor: countdown.isUrgent
                    ? "rgba(239,68,68,0.35)"
                    : "rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontWeight: countdown.isUrgent ? 700 : 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: countdown.isUrgent ? "0.3px" : undefined,
                }}
              >
                <Icon name="clock" size={11} color="#fff" />
                {countdown.isUrgent ? "URGENT — " : "Ends in "}
                {countdown.display}
              </span>
            ) : (
              <span
                style={{
                  fontSize: 12,
                  backgroundColor: "rgba(239,68,68,0.3)",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontWeight: 500,
                }}
              >
                Offer Expired
              </span>
            )}
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "50%",
            width: 64,
            height: 64,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: offer.gradientFrom ?? "var(--color-primary, #1e5f74)",
              lineHeight: 1,
            }}
          >
            {offer.discountPercent}%
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            OFF
          </span>
        </div>
      </div>

      {/* Product details */}
      <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "center" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="package" size={28} color="#94a3b8" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 6 }}>
            {offer.productName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                color: "#94a3b8",
                textDecoration: "line-through",
              }}
            >
              ₹{offer.originalPrice.toLocaleString("en-IN")}
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--color-success, #22c55e)",
              }}
            >
              ₹{offer.offerPrice.toLocaleString("en-IN")}
            </span>
          </div>
          {offer.remainingCount !== undefined && (
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color:
                  offer.remainingCount < 20
                    ? "var(--color-danger, #ef4444)"
                    : "#64748b",
                fontWeight: offer.remainingCount < 20 ? 600 : 400,
              }}
            >
              <Icon
                name="alert-circle"
                size={11}
                color={
                  offer.remainingCount < 20
                    ? "var(--color-danger, #ef4444)"
                    : "#94a3b8"
                }
              />{" "}
              {offer.remainingCount} left
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: "0 16px 14px", display: "flex", gap: 10 }}>
        <button
          onClick={() => onOrder(offer.id)}
          style={{
            flex: 1,
            padding: "10px 16px",
            backgroundColor: "var(--color-success, #22c55e)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Icon name="shopping-cart" size={15} color="#fff" />
          Order Now
        </button>
        <button
          onClick={() => onEnquiry(offer.id)}
          style={{
            flex: 1,
            padding: "10px 16px",
            backgroundColor: "#fff",
            color: "var(--color-primary, #1e5f74)",
            border: "1.5px solid var(--color-primary, #1e5f74)",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-primary-50, #eef7fa)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          <Icon name="mail" size={15} color="var(--color-primary, #1e5f74)" />
          Enquiry
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: "#f1f5f9", margin: "0 16px" }} />

      {/* Footer actions */}
      <div style={{ display: "flex", padding: "4px 8px" }}>
        <button
          onClick={handleLike}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "8px 4px",
            background: "none",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: liked ? 600 : 500,
            color: liked ? "var(--color-primary, #1e5f74)" : "#64748b",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Icon
            name="thumbs-up"
            size={16}
            color={liked ? "var(--color-primary, #1e5f74)" : "#64748b"}
          />
          {offer.likeCount + (liked ? 1 : 0)} Likes
        </button>
        <button
          onClick={() => onShare(offer.id)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "8px 4px",
            background: "none",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            color: "#64748b",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Icon name="share-2" size={16} color="#64748b" />
          {offer.shareCount} Shares
        </button>
      </div>
    </div>
  );
}
