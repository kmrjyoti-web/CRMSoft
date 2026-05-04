import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { Reminder, ReminderStats, ManagerReminderStats, CreateReminderDto, SnoozeReminderDto, ReminderFilters } from "../types/reminders.types";

const BASE = "/api/v1/reminders";

export function listReminders(params?: ReminderFilters) {
  return apiClient.get<ApiResponse<Reminder[]>>(BASE, { params }).then((r) => r.data);
}

export function getPending() {
  return apiClient.get<ApiResponse<Reminder[]>>(`${BASE}/pending`).then((r) => r.data);
}

export function getStats() {
  return apiClient.get<ApiResponse<ReminderStats>>(`${BASE}/stats`).then((r) => r.data);
}

export function getManagerStats() {
  return apiClient.get<ApiResponse<ManagerReminderStats>>(`${BASE}/manager-stats`).then((r) => r.data);
}

export function createReminder(dto: CreateReminderDto) {
  return apiClient.post<ApiResponse<Reminder>>(BASE, dto).then((r) => r.data);
}

export function dismissReminder(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/dismiss`).then((r) => r.data);
}

export function snoozeReminder(id: string, dto: SnoozeReminderDto) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/snooze`, dto).then((r) => r.data);
}

export function cancelReminder(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/cancel`).then((r) => r.data);
}

export function acknowledgeReminder(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/${id}/acknowledge`).then((r) => r.data);
}
