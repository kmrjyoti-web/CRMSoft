import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { Comment, CreateCommentDto, UpdateCommentDto, ReplyCommentDto } from "../types/comments.types";

const BASE = "/api/v1/comments";

export function getComments(entityType: string, entityId: string) {
  return apiClient.get<ApiResponse<Comment[]>>(`${BASE}/${entityType}/${entityId}`).then((r) => r.data);
}

export function getCommentThread(id: string) {
  return apiClient.get<ApiResponse<Comment>>(`${BASE}/${id}/thread`).then((r) => r.data);
}

export function createComment(dto: CreateCommentDto) {
  return apiClient.post<ApiResponse<Comment>>(BASE, dto).then((r) => r.data);
}

export function updateComment(id: string, dto: UpdateCommentDto) {
  return apiClient.put<ApiResponse<Comment>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function deleteComment(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data);
}

export function replyToComment(id: string, dto: ReplyCommentDto) {
  return apiClient.post<ApiResponse<Comment>>(`${BASE}/${id}/reply`, dto).then((r) => r.data);
}
