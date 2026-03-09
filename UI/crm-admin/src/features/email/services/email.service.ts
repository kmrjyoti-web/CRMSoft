import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  Email,
  EmailThread,
  EmailAccount,
  ComposeEmailDto,
  ReplyEmailDto,
  EmailFilters,
  EmailAnalytics,
} from "../types/email.types";

const BASE = "/api/v1/emails";
const ACCOUNTS = "/api/v1/email-accounts";

// ── Compose & Send ──────────────────────────────────────

export function composeEmail(dto: ComposeEmailDto) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/compose`, dto).then((r) => r.data);
}

export function replyToEmail(dto: ReplyEmailDto) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/reply`, dto).then((r) => r.data);
}

export function sendEmail(id: string) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/${id}/send`).then((r) => r.data);
}

export function scheduleEmail(id: string, scheduledAt: string) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/${id}/schedule`, { scheduledAt }).then((r) => r.data);
}

export function cancelSchedule(id: string) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/${id}/cancel-schedule`).then((r) => r.data);
}

// ── Actions ─────────────────────────────────────────────

export function toggleStar(id: string) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/${id}/star`).then((r) => r.data);
}

export function markRead(id: string) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/${id}/read`).then((r) => r.data);
}

export function linkToEntity(id: string, entityType: string, entityId: string) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/${id}/link`, { entityType, entityId }).then((r) => r.data);
}

export function unlinkFromEntity(id: string) {
  return apiClient.post<ApiResponse<Email>>(`${BASE}/${id}/unlink`).then((r) => r.data);
}

// ── Queries ─────────────────────────────────────────────

export function listEmails(params?: EmailFilters) {
  return apiClient.get<ApiResponse<Email[]>>(`${BASE}`, { params }).then((r) => r.data);
}

export function getEmail(id: string) {
  return apiClient.get<ApiResponse<Email>>(`${BASE}/${id}`).then((r) => r.data);
}

export function searchEmails(query: string, params?: Omit<EmailFilters, "search">) {
  return apiClient.get<ApiResponse<Email[]>>(`${BASE}/search`, { params: { ...params, q: query } }).then((r) => r.data);
}

export function getEmailThread(threadId: string) {
  return apiClient.get<ApiResponse<EmailThread>>(`${BASE}/thread/${threadId}`).then((r) => r.data);
}

export function getEntityEmails(entityType: string, entityId: string) {
  return apiClient.get<ApiResponse<Email[]>>(`${BASE}/entity/${entityType}/${entityId}`).then((r) => r.data);
}

export function getEmailAnalytics() {
  return apiClient.get<ApiResponse<EmailAnalytics>>(`${BASE}/analytics`).then((r) => r.data);
}

// ── Email Accounts ──────────────────────────────────────

export function listEmailAccounts() {
  return apiClient.get<ApiResponse<EmailAccount[]>>(ACCOUNTS).then((r) => r.data);
}

export function getEmailAccount(id: string) {
  return apiClient.get<ApiResponse<EmailAccount>>(`${ACCOUNTS}/${id}`).then((r) => r.data);
}

export function createEmailAccount(dto: Partial<EmailAccount>) {
  return apiClient.post<ApiResponse<EmailAccount>>(ACCOUNTS, dto).then((r) => r.data);
}

export function updateEmailAccount(id: string, dto: Partial<EmailAccount>) {
  return apiClient.put<ApiResponse<EmailAccount>>(`${ACCOUNTS}/${id}`, dto).then((r) => r.data);
}

export function deleteEmailAccount(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${ACCOUNTS}/${id}`).then((r) => r.data);
}

export function syncEmailAccount(id: string) {
  return apiClient.post<ApiResponse<void>>(`${ACCOUNTS}/${id}/sync`).then((r) => r.data);
}
