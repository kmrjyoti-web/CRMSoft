"use client";
import { useState } from "react";
import { Icon, Button } from "@/components/ui";

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

function getDaysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function FeedOfferCard({ offer, onOrder, onEnquiry, onLike, onShare }: FeedOfferCardProps) {
  const [liked, setLiked] = useState(false);
  const daysLeft = getDaysUntil(offer.validUntil);
  const gradFrom = offer.gradientFrom ?? "#4f46e5";
  const gradTo = offer.gradientTo ?? "#7c3aed";

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
            backgroundColor: offer.vendorColor ?? "#059669",
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
            {daysLeft > 0 ? (
              <span
                style={{
                  fontSize: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="clock" size={11} color="#fff" />
                Ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
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
                Expires today!
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
          <span style={{ fontSize: 16, fontWeight: 800, color: gradFrom, lineHeight: 1 }}>
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
            <span style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
              ₹{offer.offerPrice.toLocaleString("en-IN")}
            </span>
          </div>
          {offer.remainingCount !== undefined && (
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: offer.remainingCount < 20 ? "#dc2626" : "#64748b",
                fontWeight: offer.remainingCount < 20 ? 600 : 400,
              }}
            >
              <Icon
                name="alert-circle"
                size={11}
                color={offer.remainingCount < 20 ? "#dc2626" : "#94a3b8"}
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
            backgroundColor: "#059669",
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
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
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
            color: "#4f46e5",
            border: "1.5px solid #4f46e5",
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          <Icon name="mail" size={15} color="#4f46e5" />
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
            color: liked ? "#2563eb" : "#64748b",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <Icon name="thumbs-up" size={16} color={liked ? "#2563eb" : "#64748b"} />
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
