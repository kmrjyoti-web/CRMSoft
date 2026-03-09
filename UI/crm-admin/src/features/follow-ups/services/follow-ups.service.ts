import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  FollowUp,
  FollowUpStats,
  CreateFollowUpDto,
  SnoozeFollowUpDto,
  ReassignFollowUpDto,
  CompleteFollowUpDto,
  FollowUpFilters,
} from "../types/follow-ups.types";

const BASE = "/api/v1/follow-ups";

export function listFollowUps(params?: FollowUpFilters) {
  return apiClient.get<ApiResponse<FollowUp[]>>(BASE, { params }).then((r) => r.data);
}

export function getFollowUp(id: string) {
  return apiClient.get<ApiResponse<FollowUp>>(`${BASE}/${id}`).then((r) => r.data);
}

export function createFollowUp(dto: CreateFollowUpDto) {
  return apiClient.post<ApiResponse<FollowUp>>(BASE, dto).then((r) => r.data);
}

export function updateFollowUp(id: string, dto: Partial<CreateFollowUpDto>) {
  return apiClient.put<ApiResponse<FollowUp>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function deleteFollowUp(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data);
}

export function completeFollowUp(id: string, dto?: CompleteFollowUpDto) {
  return apiClient.post<ApiResponse<FollowUp>>(`${BASE}/${id}/complete`, dto).then((r) => r.data);
}

export function snoozeFollowUp(id: string, dto: SnoozeFollowUpDto) {
  return apiClient.post<ApiResponse<FollowUp>>(`${BASE}/${id}/snooze`, dto).then((r) => r.data);
}

export function reassignFollowUp(id: string, dto: ReassignFollowUpDto) {
  return apiClient.post<ApiResponse<FollowUp>>(`${BASE}/${id}/reassign`, dto).then((r) => r.data);
}

export function getOverdueFollowUps(params?: { page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<FollowUp[]>>(`${BASE}/overdue`, { params }).then((r) => r.data);
}

export function getFollowUpStats(params?: { userId?: string; fromDate?: string; toDate?: string }) {
  return apiClient.get<ApiResponse<FollowUpStats>>(`${BASE}/stats`, { params }).then((r) => r.data);
}
