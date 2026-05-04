import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/reminders.service";
import type { CreateReminderDto, SnoozeReminderDto, ReminderFilters } from "../types/reminders.types";

const KEY = "reminders";

export function useReminders(params?: ReminderFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listReminders(params),
  });
}

export function usePendingReminders() {
  return useQuery({
    queryKey: [KEY, "pending"],
    queryFn: () => svc.getPending(),
    refetchInterval: 60_000,
  });
}

export function useReminderStats() {
  return useQuery({
    queryKey: [KEY, "stats"],
    queryFn: () => svc.getStats(),
  });
}

export function useManagerReminderStats() {
  return useQuery({
    queryKey: [KEY, "manager-stats"],
    queryFn: () => svc.getManagerStats(),
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReminderDto) => svc.createReminder(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDismissReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.dismissReminder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSnoozeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: SnoozeReminderDto }) => svc.snoozeReminder(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCancelReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.cancelReminder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAcknowledgeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.acknowledgeReminder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
