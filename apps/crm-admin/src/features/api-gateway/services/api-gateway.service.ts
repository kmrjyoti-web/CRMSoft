import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  ApiKey,
  ApiKeyWithSecret,
  ApiScope,
  Webhook,
  WebhookEvent,
  WebhookDelivery,
  ApiLog,
  ApiUsageSummary,
  WebhookStats,
  CreateApiKeyDto,
  UpdateScopesDto,
  CreateWebhookDto,
  UpdateWebhookDto,
  ApiLogFilters,
  UsageFilters,
} from "../types/api-gateway.types";

const BASE = "/api/v1/api-gateway/admin";

// ── API Keys ─────────────────────────────────────────
export function createApiKey(dto: CreateApiKeyDto) {
  return apiClient.post<ApiResponse<ApiKeyWithSecret>>(`${BASE}/api-keys`, dto).then((r) => r.data);
}

export function listApiKeys() {
  return apiClient.get<ApiResponse<ApiKey[]>>(`${BASE}/api-keys`).then((r) => r.data);
}

export function getApiKeyScopes() {
  return apiClient.get<ApiResponse<ApiScope[]>>(`${BASE}/api-keys/scopes`).then((r) => r.data);
}

export function getApiKey(id: string) {
  return apiClient.get<ApiResponse<ApiKey>>(`${BASE}/api-keys/${id}`).then((r) => r.data);
}

export function updateApiKeyScopes(id: string, dto: UpdateScopesDto) {
  return apiClient.put<ApiResponse<ApiKey>>(`${BASE}/api-keys/${id}/scopes`, dto).then((r) => r.data);
}

export function revokeApiKey(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/api-keys/${id}/revoke`).then((r) => r.data);
}

export function regenerateApiKey(id: string) {
  return apiClient.post<ApiResponse<ApiKeyWithSecret>>(`${BASE}/api-keys/${id}/regenerate`).then((r) => r.data);
}

// ── Webhooks ─────────────────────────────────────────
export function createWebhook(dto: CreateWebhookDto) {
  return apiClient.post<ApiResponse<Webhook>>(`${BASE}/webhooks`, dto).then((r) => r.data);
}

export function listWebhooks() {
  return apiClient.get<ApiResponse<Webhook[]>>(`${BASE}/webhooks`).then((r) => r.data);
}

export function getWebhookEvents() {
  return apiClient.get<ApiResponse<WebhookEvent[]>>(`${BASE}/webhooks/events`).then((r) => r.data);
}

export function getWebhook(id: string) {
  return apiClient.get<ApiResponse<Webhook>>(`${BASE}/webhooks/${id}`).then((r) => r.data);
}

export function updateWebhook(id: string, dto: UpdateWebhookDto) {
  return apiClient.put<ApiResponse<Webhook>>(`${BASE}/webhooks/${id}`, dto).then((r) => r.data);
}

export function deleteWebhook(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/webhooks/${id}`).then((r) => r.data);
}

export function getWebhookDeliveries(id: string) {
  return apiClient.get<ApiResponse<WebhookDelivery[]>>(`${BASE}/webhooks/${id}/deliveries`).then((r) => r.data);
}

export function testWebhook(id: string) {
  return apiClient.post<ApiResponse<WebhookDelivery>>(`${BASE}/webhooks/${id}/test`).then((r) => r.data);
}

// ── Logs ─────────────────────────────────────────────
export function listApiLogs(filters?: ApiLogFilters) {
  return apiClient.get<ApiResponse<ApiLog[]>>(`${BASE}/logs`, { params: filters }).then((r) => r.data);
}

// ── Analytics ────────────────────────────────────────
export function getUsageSummary(filters?: UsageFilters) {
  return apiClient.get<ApiResponse<ApiUsageSummary>>(`${BASE}/analytics/usage`, { params: filters }).then((r) => r.data);
}

export function getWebhookStats(filters?: UsageFilters) {
  return apiClient.get<ApiResponse<WebhookStats>>(`${BASE}/analytics/webhooks`, { params: filters }).then((r) => r.data);
}
