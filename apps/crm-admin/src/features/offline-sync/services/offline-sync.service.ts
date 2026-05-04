import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  SyncPolicy,
  SyncWarningRule,
  SyncDevice,
  SyncConflict,
  FlushCommand,
  SyncDashboard,
  SyncAuditEntry,
  SyncAnalytics,
  SyncConfig,
  SyncStatus,
  UpdatePolicyDto,
  CreateWarningRuleDto,
  IssueFlushDto,
  ResolveConflictDto,
  SyncLogFilters,
} from "../types/offline-sync.types";

const SYNC = "/sync";
const ADMIN = "/admin/sync";

// ── Client-Facing ────────────────────────────────────
export function getSyncConfig() {
  return apiClient.get<ApiResponse<SyncConfig>>(`${SYNC}/config`).then((r) => r.data);
}

export function getSyncStatus() {
  return apiClient.get<ApiResponse<SyncStatus>>(`${SYNC}/status`).then((r) => r.data);
}

export function listConflicts() {
  return apiClient.get<ApiResponse<SyncConflict[]>>(`${SYNC}/conflicts`).then((r) => r.data);
}

export function getConflict(id: string) {
  return apiClient.get<ApiResponse<SyncConflict>>(`${SYNC}/conflicts/${id}`).then((r) => r.data);
}

export function resolveConflict(id: string, dto: ResolveConflictDto) {
  return apiClient.post<ApiResponse<SyncConflict>>(`${SYNC}/conflicts/${id}/resolve`, dto).then((r) => r.data);
}

// ── Admin Policies ───────────────────────────────────
export function listPolicies() {
  return apiClient.get<ApiResponse<SyncPolicy[]>>(`${ADMIN}/policies`).then((r) => r.data);
}

export function getPolicy(id: string) {
  return apiClient.get<ApiResponse<SyncPolicy>>(`${ADMIN}/policies/${id}`).then((r) => r.data);
}

export function updatePolicy(id: string, dto: UpdatePolicyDto) {
  return apiClient.put<ApiResponse<SyncPolicy>>(`${ADMIN}/policies/${id}`, dto).then((r) => r.data);
}

export function togglePolicy(id: string) {
  return apiClient.post<ApiResponse<SyncPolicy>>(`${ADMIN}/policies/${id}/toggle`).then((r) => r.data);
}

// ── Warning Rules ────────────────────────────────────
export function createWarningRule(dto: CreateWarningRuleDto) {
  return apiClient.post<ApiResponse<SyncWarningRule>>(`${ADMIN}/warning-rules`, dto).then((r) => r.data);
}

export function listWarningRules() {
  return apiClient.get<ApiResponse<SyncWarningRule[]>>(`${ADMIN}/warning-rules`).then((r) => r.data);
}

export function updateWarningRule(id: string, dto: Partial<CreateWarningRuleDto>) {
  return apiClient.put<ApiResponse<SyncWarningRule>>(`${ADMIN}/warning-rules/${id}`, dto).then((r) => r.data);
}

export function deleteWarningRule(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${ADMIN}/warning-rules/${id}`).then((r) => r.data);
}

// ── Flush Commands ───────────────────────────────────
export function issueFlush(dto: IssueFlushDto) {
  return apiClient.post<ApiResponse<FlushCommand>>(`${ADMIN}/flush`, dto).then((r) => r.data);
}

export function listFlushCommands() {
  return apiClient.get<ApiResponse<FlushCommand[]>>(`${ADMIN}/flush-commands`).then((r) => r.data);
}

// ── Devices ──────────────────────────────────────────
export function listDevices() {
  return apiClient.get<ApiResponse<SyncDevice[]>>(`${ADMIN}/devices`).then((r) => r.data);
}

export function blockDevice(id: string) {
  return apiClient.post<ApiResponse<void>>(`${ADMIN}/devices/${id}/block`).then((r) => r.data);
}

// ── Dashboard & Analytics ────────────────────────────
export function getSyncDashboard() {
  return apiClient.get<ApiResponse<SyncDashboard>>(`${ADMIN}/dashboard`).then((r) => r.data);
}

export function getSyncAudit(filters?: SyncLogFilters) {
  return apiClient.get<ApiResponse<SyncAuditEntry[]>>(`${ADMIN}/audit`, { params: filters }).then((r) => r.data);
}

export function getSyncAnalytics() {
  return apiClient.get<ApiResponse<SyncAnalytics>>(`${ADMIN}/analytics`).then((r) => r.data);
}
