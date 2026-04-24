import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

import type {
  WaConversationItem,
  WaMessageItem,
  ConversationListParams,
  MessageListParams,
  SendTextPayload,
  SendTemplatePayload,
  SendMediaPayload,
  SendInteractivePayload,
  SendLocationPayload,
  AssignConversationPayload,
  LinkEntityPayload,
} from '../types/conversation.types';

const BASE_URL = '/api/v1/whatsapp/conversations';

export const waConversationsService = {
  // ── List & Detail ────────────────────────────────────────
  getAll: (params?: ConversationListParams) =>
    apiClient.get<ApiResponse<WaConversationItem[]>>(BASE_URL, { params }).then((r) => r.data),

  search: (params: ConversationListParams) =>
    apiClient.get<ApiResponse<WaConversationItem[]>>(`${BASE_URL}/search`, { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<WaConversationItem>>(`${BASE_URL}/${id}`).then((r) => r.data),

  getMessages: (conversationId: string, params?: MessageListParams) =>
    apiClient.get<ApiResponse<WaMessageItem[]>>(`${BASE_URL}/${conversationId}/messages`, { params }).then((r) => r.data),

  getByEntity: (entityType: string, entityId: string) =>
    apiClient.get<ApiResponse<WaConversationItem[]>>(`${BASE_URL}/entity/${entityType}/${entityId}`).then((r) => r.data),

  // ── Send Messages ────────────────────────────────────────
  sendText: (conversationId: string, payload: SendTextPayload) =>
    apiClient.post<ApiResponse<WaMessageItem>>(`${BASE_URL}/${conversationId}/send-text`, payload).then((r) => r.data),

  sendTemplate: (conversationId: string, payload: SendTemplatePayload) =>
    apiClient.post<ApiResponse<WaMessageItem>>(`${BASE_URL}/${conversationId}/send-template`, payload).then((r) => r.data),

  sendMedia: (conversationId: string, payload: SendMediaPayload) =>
    apiClient.post<ApiResponse<WaMessageItem>>(`${BASE_URL}/${conversationId}/send-media`, payload).then((r) => r.data),

  sendInteractive: (conversationId: string, payload: SendInteractivePayload) =>
    apiClient.post<ApiResponse<WaMessageItem>>(`${BASE_URL}/${conversationId}/send-interactive`, payload).then((r) => r.data),

  sendLocation: (conversationId: string, payload: SendLocationPayload) =>
    apiClient.post<ApiResponse<WaMessageItem>>(`${BASE_URL}/${conversationId}/send-location`, payload).then((r) => r.data),

  // ── Actions ──────────────────────────────────────────────
  markRead: (conversationId: string) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${conversationId}/read`).then((r) => r.data),

  assign: (conversationId: string, payload: AssignConversationPayload) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${conversationId}/assign`, payload).then((r) => r.data),

  resolve: (conversationId: string) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${conversationId}/resolve`).then((r) => r.data),

  reopen: (conversationId: string) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${conversationId}/reopen`).then((r) => r.data),

  linkEntity: (conversationId: string, payload: LinkEntityPayload) =>
    apiClient.post<ApiResponse<void>>(`${BASE_URL}/${conversationId}/link`, payload).then((r) => r.data),
};
