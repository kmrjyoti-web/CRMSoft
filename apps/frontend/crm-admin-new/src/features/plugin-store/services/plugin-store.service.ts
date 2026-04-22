import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  PluginCatalogItem,
  InstalledPlugin,
  PluginLog,
  InstallPluginDto,
  UpdateCredentialsDto,
  UpdateSettingsDto,
  PluginFilters,
  HealthCheckResult,
  PluginUsageStats,
  PluginHealthSummary,
} from "../types/plugin-store.types";

const BASE = "/api/v1/plugins";

// ── Catalog ─────────────────────────────────────────────────────────

export function getCatalog(filters?: PluginFilters) {
  return apiClient.get<ApiResponse<PluginCatalogItem[]>>(`${BASE}/catalog`, { params: filters }).then((r) => r.data);
}

export function getCatalogItem(code: string) {
  return apiClient.get<ApiResponse<PluginCatalogItem>>(`${BASE}/catalog/${code}`).then((r) => r.data);
}

// ── Installed ───────────────────────────────────────────────────────

export function getInstalledPlugins() {
  return apiClient.get<ApiResponse<InstalledPlugin[]>>(`${BASE}/installed`).then((r) => r.data);
}

export function getInstalledPlugin(code: string) {
  return apiClient.get<ApiResponse<InstalledPlugin>>(`${BASE}/installed/${code}`).then((r) => r.data);
}

// ── Install / Uninstall ─────────────────────────────────────────────

export function installPlugin(code: string, dto: InstallPluginDto) {
  return apiClient.post<ApiResponse<InstalledPlugin>>(`${BASE}/install/${code}`, dto).then((r) => r.data);
}

export function uninstallPlugin(code: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${code}/uninstall`).then((r) => r.data);
}

// ── Credentials / Settings ──────────────────────────────────────────

export function updateCredentials(code: string, dto: UpdateCredentialsDto) {
  return apiClient.put<ApiResponse<InstalledPlugin>>(`${BASE}/${code}/credentials`, dto).then((r) => r.data);
}

export function updateSettings(code: string, dto: UpdateSettingsDto) {
  return apiClient.put<ApiResponse<InstalledPlugin>>(`${BASE}/${code}/settings`, dto).then((r) => r.data);
}

// ── Enable / Disable ────────────────────────────────────────────────

export function enablePlugin(code: string) {
  return apiClient.post<ApiResponse<InstalledPlugin>>(`${BASE}/${code}/enable`).then((r) => r.data);
}

export function disablePlugin(code: string) {
  return apiClient.post<ApiResponse<InstalledPlugin>>(`${BASE}/${code}/disable`).then((r) => r.data);
}

// ── Logs ────────────────────────────────────────────────────────────

export function getPluginLogs(code: string) {
  return apiClient.get<ApiResponse<PluginLog[]>>(`${BASE}/${code}/logs`).then((r) => r.data);
}

// ── Health ──────────────────────────────────────────────────────────

export function testConnection(code: string) {
  return apiClient.post<ApiResponse<HealthCheckResult>>(`${BASE}/health/${code}/test`).then((r) => r.data);
}

export function testCredentials(code: string, credentials: Record<string, string>) {
  return apiClient.post<ApiResponse<HealthCheckResult>>(`${BASE}/health/${code}/test-credentials`, { credentials }).then((r) => r.data);
}

export function getHealthSummary() {
  return apiClient.get<ApiResponse<PluginHealthSummary[]>>(`${BASE}/health/summary`).then((r) => r.data);
}

// ── Usage ───────────────────────────────────────────────────────────

export function getPluginUsage() {
  return apiClient.get<ApiResponse<PluginUsageStats[]>>(`${BASE}/usage`).then((r) => r.data);
}

// ── Check ───────────────────────────────────────────────────────────

export function checkPlugin(code: string) {
  return apiClient.get<ApiResponse<{ enabled: boolean }>>(`${BASE}/check/${code}`).then((r) => r.data);
}
