// ── Enums ────────────────────────────────────────────────

export type CommentVisibility = "PUBLIC" | "PRIVATE" | "INTERNAL";

// ── Entities ─────────────────────────────────────────────

export interface Comment {
  id: string;
  entityType: string;
  entityId: string;
  parentId?: string;
  content: string;
  visibility?: CommentVisibility;
  mentionedUserIds?: string[];
  attachments?: string[];
  authorId: string;
  authorName?: string;
  isEdited: boolean;
  editedAt?: string;
  replies?: Comment[];
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateCommentDto {
  entityType: string;
  entityId: string;
  content: string;
  visibility?: CommentVisibility;
  parentId?: string;
  mentionedUserIds?: string[];
  attachments?: string[];
}

export interface UpdateCommentDto {
  content: string;
  mentionedUserIds?: string[];
}

export interface ReplyCommentDto {
  content: string;
  mentionedUserIds?: string[];
}
