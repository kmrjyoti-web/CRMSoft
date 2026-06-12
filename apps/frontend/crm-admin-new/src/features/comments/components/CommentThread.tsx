"use client";

import { useState, useMemo, useCallback } from "react";

import { Icon } from "@/components/ui";

import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useReplyComment,
} from "../hooks/useComments";

import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

// ── Props ───────────────────────────────────────────────

interface CommentThreadProps {
  entityType: string;
  entityId: string;
}

// ── Component ───────────────────────────────────────────

export function CommentThread({ entityType, entityId }: CommentThreadProps) {
  const { data, isLoading } = useComments(entityType, entityId);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment(entityType, entityId);
  const deleteComment = useDeleteComment(entityType, entityId);
  const replyComment = useReplyComment(entityType, entityId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const comments = useMemo(() => {
    const raw = data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // Root comments only (no parentId)
  const rootComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments],
  );

  const handleCreateComment = useCallback(
    (content: string) => {
      createComment.mutate({ entityType, entityId, content });
    },
    [createComment, entityType, entityId],
  );

  const handleReply = useCallback((id: string) => {
    setReplyingToId(id);
    setEditingId(null);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setReplyingToId(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Delete this comment?")) {
        deleteComment.mutate(id);
      }
    },
    [deleteComment],
  );

  const handleSaveEdit = useCallback(
    (content: string) => {
      if (!editingId) return;
      updateComment.mutate(
        { id: editingId, dto: { content } },
        { onSuccess: () => setEditingId(null) },
      );
    },
    [editingId, updateComment],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleReplySubmit = useCallback(
    (content: string) => {
      if (!replyingToId) return;
      replyComment.mutate(
        { id: replyingToId, dto: { content } },
        { onSuccess: () => setReplyingToId(null) },
      );
    },
    [replyingToId, replyComment],
  );

  // ── Loading ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
        Loading comments...
      </div>
    );
  }

  return (
    <div>
      {/* New comment form */}
      <CommentForm
        onSubmit={handleCreateComment}
        isSubmitting={createComment.isPending}
        placeholder="Write a comment..."
      />

      {/* Comments list */}
      {rootComments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "#9ca3af",
          }}
        >
          <Icon name="message-square" size={40} />
          <p style={{ marginTop: 12, fontSize: 14 }}>No comments yet. Be the first to comment.</p>
        </div>
      ) : (
        <div>
          {rootComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isEditing={editingId === comment.id}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
              />

              {/* Inline reply form */}
              {replyingToId === comment.id && (
                <div style={{ marginLeft: 48, marginBottom: 16 }}>
                  <CommentForm
                    onSubmit={handleReplySubmit}
                    isSubmitting={replyComment.isPending}
                    placeholder={`Reply to ${comment.authorName ?? "comment"}...`}
                    autoFocus
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
