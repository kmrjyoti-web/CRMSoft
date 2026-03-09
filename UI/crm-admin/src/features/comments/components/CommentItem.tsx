"use client";

import { useState } from "react";

import { Button, Icon, Badge } from "@/components/ui";

import type { Comment } from "../types/comments.types";

// ── Helpers ─────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getInitial(name?: string): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

// ── Props ───────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  onReply?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isEditing?: boolean;
  onSaveEdit?: (content: string) => void;
  onCancelEdit?: () => void;
}

// ── Component ───────────────────────────────────────────

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  isEditing,
  onSaveEdit,
  onCancelEdit,
}: CommentItemProps) {
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = () => {
    const trimmed = editContent.trim();
    if (trimmed && onSaveEdit) {
      onSaveEdit(trimmed);
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#6366f1",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {getInitial(comment.authorName)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
            {comment.authorName ?? "Unknown"}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{timeAgo(comment.createdAt)}</span>
          {comment.isEdited && (
            <Badge variant="outline" style={{ fontSize: 10 }}>
              edited
            </Badge>
          )}
        </div>

        {/* Content or Edit textarea */}
        {isEditing ? (
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={!editContent.trim()}
              >
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "#374151", margin: "0 0 8px 0", lineHeight: 1.5 }}>
            {comment.content}
          </p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div style={{ display: "flex", gap: 12 }}>
            {onReply && (
              <button
                onClick={() => onReply(comment.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  color: "#6b7280",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="reply" size={14} />
                Reply
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(comment.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  color: "#6b7280",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="pencil" size={14} />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  color: "#ef4444",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="trash-2" size={14} />
                Delete
              </button>
            )}
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginLeft: 32, marginTop: 12 }}>
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
