import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { RecurrencePattern, CreateRecurrenceDto, RecurrenceFilters } from "../types/recurrence.types";

const BASE = "/api/v1/recurrence";

export function listRecurrences(params?: RecurrenceFilters) {
  return apiClient.get<ApiResponse<RecurrencePattern[]>>(BASE, { params }).then((r) => r.data);
}

export function getRecurrence(id: string) {
  return apiClient.get<ApiResponse<RecurrencePattern>>(`${BASE}/${id}`).then((r) => r.data);
}

export function createRecurrence(dto: CreateRecurrenceDto) {
  return apiClient.post<ApiResponse<RecurrencePattern>>(BASE, dto).then((r) => r.data);
}

export function updateRecurrence(id: string, dto: Partial<CreateRecurrenceDto>) {
  return apiClient.put<ApiResponse<RecurrencePattern>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

export function cancelRecurrence(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${BASE}/${id}`).then((r) => r.data);
}
