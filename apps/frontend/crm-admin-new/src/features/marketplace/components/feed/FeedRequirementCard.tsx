"use client";
import { useState } from "react";
import { Icon } from "@/components/ui";

export interface FeedRequirement {
  id: string;
  buyerName: string;
  buyerInitial: string;
  buyerColor?: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  quoteCount: number;
  likeCount: number;
  shareCount: number;
  tags?: string[];
}

interface FeedRequirementCardProps {
  requirement: FeedRequirement;
  onQuote: (id: string) => void;
  onEnquire: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
}

function getDaysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function FeedRequirementCard({
  requirement,
  onQuote,
  onEnquire,
  onLike,
  onShare,
}: FeedRequirementCardProps) {
  const [liked, setLiked] = useState(false);
  const daysLeft = getDaysUntil(requirement.deadline);
  const isUrgent = daysLeft <= 3;

  function handleLike() {
    setLiked((v) => !v);
    onLike(requirement.id);
  }

  const tags = requirement.tags ?? [requirement.category, requirement.quantity];

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        overflow: "hidden",
        marginBottom: 16,
        borderLeft: "4px solid #f97316",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: requirement.buyerColor ?? "#f97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {requirement.buyerInitial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
            {requirement.buyerName}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Buyer</div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
            backgroundColor: "#fff7ed",
            color: "#ea580c",
            border: "1px solid #fed7aa",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Icon name="search" size={10} color="#ea580c" />
          Looking For
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 6 }}>
          {requirement.title}
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.5,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {requirement.description}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              backgroundColor: "var(--color-primary-50, #eef7fa)",
              color: "var(--color-primary, #1e5f74)",
              border: "1px solid var(--color-primary-100, #cce8f0)",
            }}
          >
            <Icon name="tag" size={10} color="var(--color-primary, #1e5f74)" />{" "}
            {requirement.category}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              backgroundColor: "#f0fdf4",
              color: "#16a34a",
              border: "1px solid #bbf7d0",
            }}
          >
            Qty: {requirement.quantity}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              backgroundColor: "#fdf4ff",
              color: "#9333ea",
              border: "1px solid #e9d5ff",
            }}
          >
            Budget: ₹{requirement.budgetMin.toLocaleString("en-IN")} – ₹
            {requirement.budgetMax.toLocaleString("en-IN")}
          </span>
          {tags
            .filter((t) => t !== requirement.category && t !== requirement.quantity)
            .map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 20,
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                }}
              >
                {tag}
              </span>
            ))}
        </div>

        {/* Deadline chip */}
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: isUrgent ? "var(--color-danger, #ef4444)" : "#64748b",
              backgroundColor: isUrgent ? "var(--color-danger-light, #fee2e2)" : "#f8fafc",
              border: `1px solid ${isUrgent ? "#fecaca" : "#e2e8f0"}`,
              padding: "4px 10px",
              borderRadius: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Icon
              name="clock"
              size={11}
              color={isUrgent ? "var(--color-danger, #ef4444)" : "#64748b"}
            />
            {daysLeft === 0
              ? "Closes today!"
              : `Closes in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: "0 16px 14px", display: "flex", gap: 10 }}>
        <button
          onClick={() => onQuote(requirement.id)}
          style={{
            flex: 1,
            padding: "10px 16px",
            backgroundColor: "var(--color-primary, #1e5f74)",
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
          <Icon name="file-text" size={15} color="#fff" />
          Submit Quote
        </button>
        <button
          onClick={() => onEnquire(requirement.id)}
          style={{
            flex: 1,
            padding: "10px 16px",
            backgroundColor: "#fff",
            color: "#f97316",
            border: "1.5px solid #f97316",
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff7ed")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          <Icon name="message-circle" size={15} color="#f97316" />
          Enquire
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: "#f1f5f9", margin: "0 16px" }} />

      {/* Footer actions */}
      <div style={{ display: "flex", padding: "4px 8px", justifyContent: "space-between" }}>
        <div style={{ display: "flex" }}>
          <button
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 14px",
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
            {requirement.likeCount + (liked ? 1 : 0)} Likes
          </button>
          <button
            onClick={() => onShare(requirement.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 14px",
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
            {requirement.shareCount} Shares
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "8px 14px",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          <Icon name="file-text" size={13} color="#64748b" />
          {requirement.quoteCount} quotes received
        </div>
      </div>
    </div>
  );
}
