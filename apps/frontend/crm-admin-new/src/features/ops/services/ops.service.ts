import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  DbSummary,
  TableStat,
  IndexStatsResponse,
  BloatAnalysis,
  SlowQuery,
  ConnectionPool,
  MaintenanceResult,
  CleanupResult,
  BackupLog,
  RestoreLog,
  BackupResult,
  BackupSchema,
  HealthCheck,
} from "../types/ops.types";

const DB = "/api/v1/ops/db-maintenance";
const BK = "/api/v1/ops/backups";
const HLT = "/api/v1/health";

// ─── DB Maintenance ──────────────────────────────────────────────────────────

export function getDbSummary() {
  return apiClient.get<ApiResponse<DbSummary>>(`${DB}/summary`).then((r) => r.data);
}

export function getTableStats() {
  return apiClient.get<ApiResponse<TableStat[]>>(`${DB}/tables`).then((r) => r.data);
}

export function getIndexStats() {
  return apiClient.get<ApiResponse<IndexStatsResponse>>(`${DB}/indexes`).then((r) => r.data);
}

export function getBloatAnalysis() {
  return apiClient.get<ApiResponse<BloatAnalysis>>(`${DB}/bloat`).then((r) => r.data);
}

export function getSlowQueries(limit = 20) {
  return apiClient.get<ApiResponse<SlowQuery[]>>(`${DB}/slow-queries`, { params: { limit } }).then((r) => r.data);
}

export function getConnectionPool() {
  return apiClient.get<ApiResponse<ConnectionPool>>(`${DB}/connections`).then((r) => r.data);
}

export function runVacuum(tableName?: string, full?: boolean) {
  return apiClient.post<ApiResponse<MaintenanceResult>>(`${DB}/vacuum`, { tableName, full }).then((r) => r.data);
}

export function runAnalyze(tableName?: string) {
  return apiClient.post<ApiResponse<MaintenanceResult>>(`${DB}/analyze`, { tableName }).then((r) => r.data);
}

export function runReindex(indexName: string) {
  return apiClient.post<ApiResponse<MaintenanceResult>>(`${DB}/reindex`, { indexName }).then((r) => r.data);
}

export function cleanupDevLogs() {
  return apiClient.post<ApiResponse<CleanupResult>>(`${DB}/cleanup/dev-logs`).then((r) => r.data);
}

export function cleanupErrorLogs() {
  return apiClient.post<ApiResponse<CleanupResult>>(`${DB}/cleanup/error-logs`).then((r) => r.data);
}

export function cleanupAuditLogs() {
  return apiClient.post<ApiResponse<CleanupResult>>(`${DB}/cleanup/audit-logs`).then((r) => r.data);
}

export function cleanupAll() {
  return apiClient.post<ApiResponse<CleanupResult[]>>(`${DB}/cleanup/all`).then((r) => r.data);
}

// ─── Backups ─────────────────────────────────────────────────────────────────

export function listBackups(schema?: string) {
  return apiClient.get<ApiResponse<BackupLog[]>>(BK, { params: { schema } }).then((r) => r.data);
}

export function getBackup(id: string) {
  return apiClient.get<ApiResponse<BackupLog>>(`${BK}/${id}`).then((r) => r.data);
}

export function getBackupDownloadUrl(id: string) {
  return apiClient.get<ApiResponse<{ url: string; expiresIn: number }>>(`${BK}/${id}/download`).then((r) => r.data);
}

export function runBackup(schema: BackupSchema, retentionDays?: number) {
  return apiClient.post<ApiResponse<BackupResult>>(`${BK}/run`, { schema, retentionDays }).then((r) => r.data);
}

export function runBackupAll() {
  return apiClient.post<ApiResponse<BackupResult[]>>(`${BK}/run-all`).then((r) => r.data);
}

export function restoreBackup(id: string, notes?: string) {
  return apiClient.post<ApiResponse<{ status: string; logId: string }>>(`${BK}/${id}/restore`, { notes }).then((r) => r.data);
}

export function listRestores() {
  return apiClient.get<ApiResponse<RestoreLog[]>>(`${BK}/restores/list`).then((r) => r.data);
}

export function cleanupBackups() {
  return apiClient.post<ApiResponse<{ deleted: number }>>(`${BK}/cleanup`).then((r) => r.data);
}

export function getPgDumpStatus() {
  return apiClient.get<ApiResponse<{ available: boolean }>>(`${BK}/status/pg-dump`).then((r) => r.data);
}

// ─── Health ──────────────────────────────────────────────────────────────────

export function getHealthCheck() {
  return apiClient.get<HealthCheck>(HLT).then((r) => r.data);
}

export function getDeepHealthCheck() {
  return apiClient.get<HealthCheck>(`${HLT}/deep`).then((r) => r.data);
}
