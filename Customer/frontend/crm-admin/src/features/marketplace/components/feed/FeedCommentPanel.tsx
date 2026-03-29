"use client";
import { useState } from "react";
import { Button, Icon } from "@/components/ui";

export interface Comment {
  id: string;
  authorName: string;
  authorInitial: string;
  text: string;
  createdAt: string;
}

interface FeedCommentPanelProps {
  postId: string;
  comments: Comment[];
  totalComments: number;
  onAddComment: (postId: string, content: string) => void;
}

const AVATAR_COLORS = ["var(--color-primary, #1e5f74)", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed"];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function FeedCommentPanel({ postId, comments, totalComments, onAddComment }: FeedCommentPanelProps) {
  const [commentText, setCommentText] = useState("");
  const [showAll, setShowAll] = useState(false);

  const visibleComments = showAll ? comments : comments.slice(0, 2);

  function handleSend() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onAddComment(postId, trimmed);
    setCommentText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        borderTop: "1px solid #f1f5f9",
        padding: "12px 16px",
        backgroundColor: "#fafafa",
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
      }}
    >
      {totalComments > 2 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-primary, #1e5f74)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            marginBottom: 10,
            padding: 0,
          }}
        >
          View all {totalComments} comments
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {visibleComments.map((c) => (
          <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: getAvatarColor(c.authorName),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {c.authorInitial || c.authorName.charAt(0).toUpperCase()}
            </div>
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: "8px 12px",
                flex: 1,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 12, color: "#1e293b", marginBottom: 2 }}>
                {c.authorName}
              </div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>{c.text}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{c.createdAt}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "var(--color-primary, #1e5f74)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          Y
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment... (Enter to send)"
            rows={1}
            style={{
              width: "100%",
              border: "1px solid #e2e8f0",
              borderRadius: 20,
              padding: "8px 44px 8px 14px",
              fontSize: 13,
              color: "#1e293b",
              resize: "none",
              outline: "none",
              backgroundColor: "#fff",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.4,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!commentText.trim()}
            style={{
              position: "absolute",
              right: 8,
              bottom: 7,
              background: commentText.trim() ? "var(--color-primary, #1e5f74)" : "#e2e8f0",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: commentText.trim() ? "pointer" : "default",
              transition: "background 0.2s",
            }}
          >
            <Icon name="send" size={13} color={commentText.trim() ? "#fff" : "#94a3b8"} />
          </button>
        </div>
      </div>
    </div>
  );
}
