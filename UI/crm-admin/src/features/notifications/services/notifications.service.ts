import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  Notification,
  NotificationPreference,
  NotificationStats,
  NotificationListParams,
  UpdatePreferencesDto,
} from "../types/notifications.types";

const BASE_URL = "/api/v1/notifications";
const SETTINGS_URL = "/api/v1/notification-settings";

export const notificationsService = {
  // ── List ───────────────────────────────────────────────
  list: (params?: NotificationListParams) =>
    apiClient
      .get<ApiResponse<Notification[]>>(BASE_URL, { params })
      .then((r) => r.data),

  // ── Detail ─────────────────────────────────────────────
  getById: (id: string) =>
    apiClient
      .get<ApiResponse<Notification>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  // ── Unread Count ───────────────────────────────────────
  getUnreadCount: () =>
    apiClient
      .get<ApiResponse<{ count: number }>>(`${BASE_URL}/unread-count`)
      .then((r) => r.data),

  // ── Stats ──────────────────────────────────────────────
  getStats: () =>
    apiClient
      .get<ApiResponse<NotificationStats>>(`${BASE_URL}/stats`)
      .then((r) => r.data),

  // ── Mark Read ──────────────────────────────────────────
  markRead: (id: string) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/${id}/read`)
      .then((r) => r.data),

  // ── Mark All Read ──────────────────────────────────────
  markAllRead: (category?: string) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/mark-all-read`, { category })
      .then((r) => r.data),

  // ── Dismiss ────────────────────────────────────────────
  dismiss: (id: string) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/${id}/dismiss`)
      .then((r) => r.data),

  // ── Bulk Mark Read ─────────────────────────────────────
  bulkMarkRead: (ids: string[]) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/bulk/read`, { ids })
      .then((r) => r.data),

  // ── Bulk Dismiss ───────────────────────────────────────
  bulkDismiss: (ids: string[]) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/bulk/dismiss`, { ids })
      .then((r) => r.data),

  // ── Preferences ────────────────────────────────────────
  getPreferences: () =>
    apiClient
      .get<ApiResponse<NotificationPreference>>(`${SETTINGS_URL}/preferences`)
      .then((r) => r.data),

  updatePreferences: (dto: UpdatePreferencesDto) =>
    apiClient
      .put<ApiResponse<NotificationPreference>>(`${SETTINGS_URL}/preferences`, dto)
      .then((r) => r.data),
};
