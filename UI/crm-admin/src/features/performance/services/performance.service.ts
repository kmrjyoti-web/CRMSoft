import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  Target,
  TargetProgress,
  LeaderboardEntry,
  TeamPerformance,
  CreateTargetDto,
} from "../types/performance.types";

const BASE = "/api/v1/performance";

// ── Leaderboard ─────────────────────────────────────────

export function getLeaderboard(params?: { period?: string; teamId?: string; limit?: number }) {
  return apiClient.get<ApiResponse<LeaderboardEntry[]>>(`${BASE}/leaderboard`, { params }).then((r) => r.data);
}

export function getTeamPerformance(params?: { period?: string; teamId?: string }) {
  return apiClient.get<ApiResponse<TeamPerformance>>(`${BASE}/team`, { params }).then((r) => r.data);
}

// ── Targets ─────────────────────────────────────────────

export function listTargets(params?: { scope?: string; userId?: string; isActive?: boolean }) {
  return apiClient.get<ApiResponse<Target[]>>(`${BASE}/targets`, { params }).then((r) => r.data);
}

export function createTarget(dto: CreateTargetDto) {
  return apiClient.post<ApiResponse<Target>>(`${BASE}/targets`, dto).then((r) => r.data);
}

export function updateTarget(id: string, dto: Partial<CreateTargetDto>) {
  return apiClient.patch<ApiResponse<Target>>(`${BASE}/targets/${id}`, dto).then((r) => r.data);
}

export function deleteTarget(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/targets/${id}`).then((r) => r.data);
}

// ── Tracking ────────────────────────────────────────────

export function getUserProgress(userId: string) {
  return apiClient.get<ApiResponse<TargetProgress[]>>(`${BASE}/tracking/${userId}`).then((r) => r.data);
}
