"use client";
import { useState, useEffect, useRef } from "react";
import { Icon, Badge } from "@/components/ui";
import type { MarketplacePost, PostType } from "../../types/marketplace.types";
import { FeedCommentPanel } from "./FeedCommentPanel";
import type { Comment } from "./FeedCommentPanel";

interface FeedPostCardProps {
  post: MarketplacePost;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string, content: string) => void;
  onShare: (id: string) => void;
  currentUserId?: string;
  onEdit?: (post: MarketplacePost) => void;
}

const AVATAR_COLORS = [
  "var(--color-primary, #1e5f74)",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const POST_TYPE_LABELS: Record<PostType, string> = {
  TEXT: "Post",
  IMAGE: "Photo",
  VIDEO: "Video",
  PRODUCT_SHARE: "Product",
  CUSTOMER_FEEDBACK: "Feedback",
  PRODUCT_LAUNCH: "Launch",
  POLL: "Poll",
  ANNOUNCEMENT: "Announcement",
};

const POST_TYPE_COLORS: Record<PostType, { bg: string; text: string }> = {
  TEXT: { bg: "var(--color-primary-50, #eef7fa)", text: "var(--color-primary, #1e5f74)" },
  IMAGE: { bg: "#f0fdf4", text: "#16a34a" },
  VIDEO: { bg: "#fef3c7", text: "#d97706" },
  PRODUCT_SHARE: { bg: "#f5f3ff", text: "#7c3aed" },
  CUSTOMER_FEEDBACK: { bg: "#fdf2f8", text: "#9d174d" },
  PRODUCT_LAUNCH: { bg: "#fff7ed", text: "#ea580c" },
  POLL: { bg: "#f0f9ff", text: "#0369a1" },
  ANNOUNCEMENT: { bg: "#fef2f2", text: "#dc2626" },
};

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Mock author names/initials since post only has authorId
const MOCK_AUTHORS = ["Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sunita Reddy", "Vikram Singh"];
function getAuthorName(authorId: string): string {
  let hash = 0;
  for (let i = 0; i < authorId.length; i++) hash = authorId.charCodeAt(i) + ((hash << 5) - hash);
  return MOCK_AUTHORS[Math.abs(hash) % MOCK_AUTHORS.length];
}

// Mock comments
const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    authorName: "Neha Gupta",
    authorInitial: "N",
    text: "This looks great! Very useful.",
    createdAt: "2h ago",
  },
  {
    id: "c2",
    authorName: "Suresh Babu",
    authorInitial: "S",
    text: "Interested, please share more details.",
    createdAt: "1h ago",
  },
  {
    id: "c3",
    authorName: "Pooja Mehta",
    authorInitial: "P",
    text: "Excellent product!",
    createdAt: "30m ago",
  },
];

// Star rating display component
function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: 18,
            color: i < rating ? "#f59e0b" : "#e2e8f0",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// Poll option with progress bar
function PollOption({ text, votes, total }: { text: string; votes: number; total: number }) {
  const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#374151",
          marginBottom: 4,
        }}
      >
        <span>{text}</span>
        <span style={{ fontWeight: 600, color: "var(--color-primary, #1e5f74)" }}>{pct}%</span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 4,
            backgroundColor: "var(--color-primary, #1e5f74)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

export function FeedPostCard({ post, onLike, onSave, onComment, onShare, currentUserId, onEdit }: FeedPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnPost = !!currentUserId && post.authorId === currentUserId;
  const hasVersion = (post.version ?? 1) > 1 || !!post.rootPostId;
  const versionNum = post.version ?? 1;
  const isTransactional = post.postCategory === "TRANSACTIONAL" || (post.postType === "PRODUCT_SHARE" || post.postType === "PRODUCT_LAUNCH");

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);
  const authorName = getAuthorName(post.authorId);
  const authorInitial = authorName.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(post.authorId);
  const typeStyle = POST_TYPE_COLORS[post.postType] ?? { bg: "#f1f5f9", text: "#475569" };

  const contentText = post.content ?? "";
  const isTruncated = contentText.length > 200 && !expanded;
  const displayContent = isTruncated ? contentText.substring(0, 200) + "..." : contentText;

  function handleLike() {
    setLiked((v) => !v);
    onLike(post.id);
  }

  function handleSave() {
    setSaved((v) => !v);
    onSave(post.id);
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        marginBottom: 16,
      }}
    >
      {/* ANNOUNCEMENT banner at top */}
      {post.postType === "ANNOUNCEMENT" && (
        <div
          style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #fcd34d",
          }}
        >
          <Icon name="megaphone" size={16} color="#d97706" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e", letterSpacing: "0.3px" }}>
            ANNOUNCEMENT
          </span>
        </div>
      )}

      {/* PRODUCT_LAUNCH banner at top */}
      {post.postType === "PRODUCT_LAUNCH" && (
        <div
          style={{
            background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #fdba74",
          }}
        >
          <span style={{ fontSize: 16 }}>🚀</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#ea580c", letterSpacing: "0.3px" }}>
            {post.badgeText ?? "NEW LAUNCH"}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", padding: "16px 16px 12px", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {authorInitial}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{authorName}</span>
            <span
              style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                backgroundColor: typeStyle.bg, color: typeStyle.text,
                textTransform: "uppercase", letterSpacing: "0.5px",
              }}
            >
              {POST_TYPE_LABELS[post.postType]}
            </span>
            {/* Version badge for transactional posts */}
            {isTransactional && (
              <span
                title={hasVersion ? `Version ${versionNum} of this post` : "Transactional post — versioned on edit"}
                style={{
                  fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
                  backgroundColor: hasVersion ? "#fff7ed" : "#f5f3ff",
                  color: hasVersion ? "#ea580c" : "#7c3aed",
                  border: `1px solid ${hasVersion ? "#fed7aa" : "#ddd6fe"}`,
                  letterSpacing: "0.3px",
                  cursor: "default",
                }}
              >
                v{versionNum}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {formatTimestamp(post.createdAt)}
            {post.visibility !== "PUBLIC" && (
              <span style={{ marginLeft: 6 }}>
                <Icon name="users" size={11} /> {post.visibility}
              </span>
            )}
            {post.editedAt && (
              <span style={{ marginLeft: 6, color: "#d97706" }}>· edited</span>
            )}
          </div>
        </div>

        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, color: "#64748b" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Icon name="more-horizontal" size={18} />
          </button>
          {menuOpen && (
            <div style={{ position: "absolute", right: 0, top: "100%", backgroundColor: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", padding: "4px 0", zIndex: 10, minWidth: 160 }}>
              {isOwnPost && (
                <button
                  onClick={() => { setMenuOpen(false); onEdit?.(post); }}
                  style={{ display: "flex", width: "100%", textAlign: "left", padding: "9px 16px", background: "none", border: "none", fontSize: 13, color: "var(--color-primary, #1e5f74)", cursor: "pointer", alignItems: "center", gap: 8, fontWeight: 600 }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-50, #eef7fa)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Icon name="edit-2" size={13} color="var(--color-primary, #1e5f74)" />
                  Edit Post
                  {isTransactional && <span style={{ fontSize: 10, color: "#ea580c", marginLeft: "auto" }}>+v{versionNum + 1}</span>}
                </button>
              )}
              {[
                { label: "Hide", icon: "eye-off" },
                { label: "Copy Link", icon: "link" },
                { label: "Report", icon: "flag", danger: true },
              ].map(({ label, icon, danger }) => (
                <button
                  key={label}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", width: "100%", textAlign: "left", padding: "9px 16px", background: "none", border: "none", fontSize: 13, color: danger ? "#dc2626" : "#374151", cursor: "pointer", alignItems: "center", gap: 8 }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = danger ? "#fef2f2" : "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={13} color={danger ? "#dc2626" : "#94a3b8"} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER_FEEDBACK: star rating above content */}
      {post.postType === "CUSTOMER_FEEDBACK" && (
        <div style={{ padding: "0 16px 10px", display: "flex", alignItems: "center", gap: 10 }}>
          <StarRating rating={post.rating ?? 5} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
            {post.rating ?? 5}.0 / 5.0 Rating
          </span>
        </div>
      )}

      {/* Content */}
      {contentText && (
        <div style={{ padding: "0 16px 12px" }}>
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 }}>
            {displayContent}
            {isTruncated && (
              <button
                onClick={() => setExpanded(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary, #1e5f74)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: 0,
                  marginLeft: 4,
                }}
              >
                more
              </button>
            )}
          </p>
          {post.hashtags.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    color: "var(--color-primary, #1e5f74)",
                    fontWeight: 500,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* IMAGE: styled image placeholder with overlay */}
      {post.postType === "IMAGE" && (
        <div
          style={{
            backgroundColor: "#e2e8f0",
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderTop: "1px solid #f1f5f9",
            borderBottom: "1px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          {/* Faux gradient background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, var(--color-primary-50, #eef7fa) 0%, var(--color-primary-100, #cce8f0) 100%)",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <Icon name="image" size={28} color="var(--color-primary, #1e5f74)" />
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-primary, #1e5f74)",
                backgroundColor: "rgba(255,255,255,0.7)",
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              📷 Image
            </span>
          </div>
        </div>
      )}

      {/* VIDEO: thumbnail placeholder with play button */}
      {post.postType === "VIDEO" && (
        <div
          style={{
            backgroundColor: "#0f172a",
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            position: "relative",
            cursor: "pointer",
          }}
        >
          {/* Faux video thumbnail gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
            }}
          />
          <div
            style={{
              position: "relative",
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <Icon name="play" size={24} color="#fff" />
          </div>
          <span
            style={{
              position: "relative",
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              backgroundColor: "rgba(0,0,0,0.3)",
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            ▶ Video content
          </span>
        </div>
      )}

      {/* PRODUCT_SHARE */}
      {post.postType === "PRODUCT_SHARE" && (
        <div
          style={{
            margin: "0 16px 12px",
            border: "1px solid var(--color-primary-100, #cce8f0)",
            borderRadius: 10,
            padding: 12,
            display: "flex",
            gap: 12,
            backgroundColor: "var(--color-primary-50, #eef7fa)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              backgroundColor: "var(--color-primary-100, #cce8f0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="package" size={24} color="var(--color-primary, #1e5f74)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>
              Featured Product
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
              High quality product with excellent specifications
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#059669" }}>₹2,499</span>
              <button
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-primary, #1e5f74)",
                  background: "var(--color-primary-50, #eef7fa)",
                  border: "1px solid var(--color-primary-100, #cce8f0)",
                  borderRadius: 6,
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                View Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT: detail banner (below content) */}
      {post.postType === "ANNOUNCEMENT" && (
        <div
          style={{
            margin: "0 16px 12px",
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid #fcd34d",
          }}
        >
          <Icon name="megaphone" size={20} color="#d97706" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
            Important Announcement
          </span>
        </div>
      )}

      {/* PRODUCT_LAUNCH: featured product card */}
      {post.postType === "PRODUCT_LAUNCH" && (
        <div
          style={{
            margin: "0 16px 12px",
            background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
            borderRadius: 10,
            padding: "14px 16px",
            border: "1px solid #fdba74",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(234,88,12,0.15)",
            }}
          >
            <span style={{ fontSize: 24 }}>🚀</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#9a3412", marginBottom: 2 }}>
              New Product Launch
            </div>
            <div style={{ fontSize: 12, color: "#c2410c" }}>
              {post.badgeText ?? "Now available — order today!"}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER_FEEDBACK: testimonial card */}
      {post.postType === "CUSTOMER_FEEDBACK" && (
        <div
          style={{
            margin: "0 16px 12px",
            backgroundColor: "#fffbeb",
            borderRadius: 10,
            padding: "12px 16px",
            border: "1px solid #fde68a",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>💬</span>
          <div>
            <StarRating rating={post.rating ?? 5} />
            <div style={{ fontSize: 12, color: "#78350f", marginTop: 4, fontStyle: "italic" }}>
              Verified customer review
            </div>
          </div>
        </div>
      )}

      {/* POLL: poll options with progress bars */}
      {post.postType === "POLL" && (() => {
        const opts = post.pollOptions ?? [
          { text: "Bank Transfer (NEFT/RTGS)", votes: 45 },
          { text: "UPI / QR Code", votes: 82 },
          { text: "Credit (30 days)", votes: 38 },
          { text: "Cash on Delivery", votes: 15 },
        ];
        const total = opts.reduce((acc, o) => acc + o.votes, 0);
        return (
          <div
            style={{
              margin: "0 16px 12px",
              padding: "14px",
              backgroundColor: "#f0f9ff",
              borderRadius: 10,
              border: "1px solid #bae6fd",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0369a1",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon name="bar-chart-2" size={14} color="#0369a1" />
              {total} votes · Poll
            </div>
            {opts.map((opt) => (
              <PollOption key={opt.text} text={opt.text} votes={opt.votes} total={total} />
            ))}
          </div>
        );
      })()}

      {/* Stats row */}
      <div
        style={{
          padding: "6px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748b" }}>
          {post.likeCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 13 }}>👍</span> {post.likeCount + (liked ? 1 : 0)} likes
            </span>
          )}
          {post.commentCount > 0 && <span>{post.commentCount} comments</span>}
        </div>
        {post.shareCount > 0 && (
          <span style={{ fontSize: 12, color: "#64748b" }}>{post.shareCount} shares</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: "#f1f5f9", margin: "0 16px" }} />

      {/* Action bar */}
      <div style={{ display: "flex", padding: "4px 8px" }}>
        {[
          {
            icon: "thumbs-up" as const,
            label: "Like",
            active: liked,
            onClick: handleLike,
            color: liked ? "var(--color-primary, #1e5f74)" : "#64748b",
          },
          {
            icon: "message-circle" as const,
            label: "Comment",
            active: showComments,
            onClick: () => setShowComments((v) => !v),
            color: showComments ? "var(--color-primary, #1e5f74)" : "#64748b",
          },
          {
            icon: "share-2" as const,
            label: "Share",
            active: false,
            onClick: () => onShare(post.id),
            color: "#64748b",
          },
          {
            icon: "bookmark" as const,
            label: "Save",
            active: saved,
            onClick: handleSave,
            color: saved ? "#d97706" : "#64748b",
          },
        ].map(({ icon, label, active, onClick, color }) => (
          <button
            key={label}
            onClick={onClick}
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
              fontWeight: active ? 600 : 500,
              color,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} color={color} />
            {label}
          </button>
        ))}
      </div>

      {/* Comment panel */}
      {showComments && (
        <FeedCommentPanel
          postId={post.id}
          comments={MOCK_COMMENTS.slice(0, post.commentCount || 2)}
          totalComments={post.commentCount}
          onAddComment={onComment}
        />
      )}
    </div>
  );
}

// Re-export Badge to prevent unused import lint error (Badge imported for potential future use)
export { Badge };
