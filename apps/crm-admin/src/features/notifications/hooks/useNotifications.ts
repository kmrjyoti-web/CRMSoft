import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";
import type {
  NotificationListParams,
  UpdatePreferencesDto,
} from "../types/notifications.types";

const KEY = "notifications";

export function useNotificationsList(params?: NotificationListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => notificationsService.list(params),
  });
}

export function useNotificationDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => notificationsService.getById(id),
    enabled: !!id,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [KEY, "unread-count"],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30_000,
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: [KEY, "stats"],
    queryFn: () => notificationsService.getStats(),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (category?: string) => notificationsService.markAllRead(category),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDismissNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.dismiss(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useBulkMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => notificationsService.bulkMarkRead(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useBulkDismiss() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => notificationsService.bulkDismiss(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

// ── Preferences ──────────────────────────────────────────

export function useNotificationPreferences() {
  return useQuery({
    queryKey: [KEY, "preferences"],
    queryFn: () => notificationsService.getPreferences(),
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePreferencesDto) =>
      notificationsService.updatePreferences(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "preferences"] });
    },
  });
}
