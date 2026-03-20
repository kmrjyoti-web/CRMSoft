"use client";
import { useState } from "react";
import { Icon, Button, Badge } from "@/components/ui";
import type { MarketplacePost, PostType } from "../../types/marketplace.types";
import { FeedCommentPanel } from "./FeedCommentPanel";
import type { Comment } from "./FeedCommentPanel";

interface FeedPostCardProps {
  post: MarketplacePost;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string, content: string) => void;
  onShare: (id: string) => void;
}

const AVATAR_COLORS = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed"];

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
  TEXT: { bg: "#eff6ff", text: "#2563eb" },
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
  { id: "c1", authorName: "Neha Gupta", authorInitial: "N", text: "This looks great! Very useful.", createdAt: "2h ago" },
  { id: "c2", authorName: "Suresh Babu", authorInitial: "S", text: "Interested, please share more details.", createdAt: "1h ago" },
  { id: "c3", authorName: "Pooja Mehta", authorInitial: "P", text: "Excellent product!", createdAt: "30m ago" },
];

export function FeedPostCard({ post, onLike, onSave, onComment, onShare }: FeedPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 20,
                backgroundColor: typeStyle.bg,
                color: typeStyle.text,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {POST_TYPE_LABELS[post.postType]}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {formatTimestamp(post.createdAt)}
            {post.visibility !== "PUBLIC" && (
              <span style={{ marginLeft: 6 }}>
                <Icon name="users" size={11} /> {post.visibility}
              </span>
            )}
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
              color: "#64748b",
            }}
          >
            <Icon name="more-horizontal" size={18} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                backgroundColor: "#fff",
                borderRadius: 8,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                padding: "4px 0",
                zIndex: 10,
                minWidth: 140,
              }}
            >
              {["Edit Post", "Hide", "Report", "Copy Link"].map((item) => (
                <button
                  key={item}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 16px",
                    background: "none",
                    border: "none",
                    fontSize: 13,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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
                  color: "#4f46e5",
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
                <span key={tag} style={{ fontSize: 12, color: "#4f46e5", fontWeight: 500 }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Media placeholders */}
      {post.postType === "IMAGE" && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 8,
            borderTop: "1px solid #f1f5f9",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Icon name="image" size={40} color="#cbd5e1" />
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Image content</span>
        </div>
      )}

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
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <Icon name="play" size={24} color="#fff" />
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Video content</span>
        </div>
      )}

      {post.postType === "PRODUCT_SHARE" && (
        <div
          style={{
            margin: "0 16px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 12,
            display: "flex",
            gap: 12,
            backgroundColor: "#fafafa",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="package" size={24} color="#94a3b8" />
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
                  color: "#4f46e5",
                  background: "#eff6ff",
                  border: "1px solid #c7d2fe",
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
      <div
        style={{
          display: "flex",
          padding: "4px 8px",
        }}
      >
        {[
          {
            icon: liked ? "thumbs-up" : "thumbs-up",
            label: "Like",
            active: liked,
            onClick: handleLike,
            color: liked ? "#2563eb" : "#64748b",
          },
          {
            icon: "message-circle" as const,
            label: "Comment",
            active: showComments,
            onClick: () => setShowComments((v) => !v),
            color: showComments ? "#7c3aed" : "#64748b",
          },
          {
            icon: "share-2" as const,
            label: "Share",
            active: false,
            onClick: () => onShare(post.id),
            color: "#64748b",
          },
          {
            icon: saved ? "bookmark" : "bookmark",
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
