import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { calendarService } from "../services/calendar.service";
import type {
  CalendarQueryParams,
  CreateEventDto,
  RSVPDto,
  RescheduleEventDto,
  AddParticipantDto,
  EventFilters,
  CreateBlockedSlotDto,
  CheckConflictsDto,
  FindFreeSlotsDto,
  ConnectSyncDto,
  CreateHolidayDto,
  WorkingHours,
} from "../types/calendar.types";

const KEY = "calendar";

// ── Unified / Views ──────────────────────────────────────────────────
export function useUnifiedCalendar(params: CalendarQueryParams) {
  return useQuery({
    queryKey: [KEY, "unified", params],
    queryFn: () => calendarService.getUnified(params),
    staleTime: 60_000,
  });
}

export function useCalendarStats() {
  return useQuery({
    queryKey: [KEY, "stats"],
    queryFn: () => calendarService.getStats(),
    staleTime: 60_000,
  });
}

export function useCalendarAgenda(date: string) {
  return useQuery({
    queryKey: [KEY, "agenda", date],
    queryFn: () => calendarService.getAgenda(date),
    enabled: !!date,
  });
}

export function useTeamCalendar(params?: { userIds?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [KEY, "team", params],
    queryFn: () => calendarService.getTeamCalendar(params),
  });
}

// ── Event CRUD ───────────────────────────────────────────────────────
export function useCalendarEvents(params?: EventFilters) {
  return useQuery({
    queryKey: [KEY, "events", params],
    queryFn: () => calendarService.listEvents(params),
  });
}

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: [KEY, "events", id],
    queryFn: () => calendarService.getEvent(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEventDto) => calendarService.createEvent(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreateEventDto> }) => calendarService.updateEvent(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRescheduleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: RescheduleEventDto }) => calendarService.rescheduleEvent(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAddParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: AddParticipantDto }) => calendarService.addParticipant(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRemoveParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; uid: string }) => calendarService.removeParticipant(vars.id, vars.uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRSVP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: RSVPDto }) => calendarService.rsvp(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

// ── Availability ─────────────────────────────────────────────────────
export function useWorkingHours() {
  return useQuery({
    queryKey: [KEY, "working-hours"],
    queryFn: () => calendarService.getWorkingHours(),
  });
}

export function useSetWorkingHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hours: WorkingHours[]) => calendarService.setWorkingHours(hours),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "working-hours"] }),
  });
}

export function useBlockedSlots() {
  return useQuery({
    queryKey: [KEY, "blocked-slots"],
    queryFn: () => calendarService.listBlockedSlots(),
  });
}

export function useCreateBlockedSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBlockedSlotDto) => calendarService.createBlockedSlot(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "blocked-slots"] }),
  });
}

export function useDeleteBlockedSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.deleteBlockedSlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "blocked-slots"] }),
  });
}

export function useCheckConflicts() {
  return useMutation({
    mutationFn: (dto: CheckConflictsDto) => calendarService.checkConflicts(dto),
  });
}

export function useFindFreeSlots() {
  return useMutation({
    mutationFn: (dto: FindFreeSlotsDto) => calendarService.findFreeSlots(dto),
  });
}

// ── Sync ─────────────────────────────────────────────────────────────
export function useSyncStatus() {
  return useQuery({
    queryKey: [KEY, "sync-status"],
    queryFn: () => calendarService.getSyncStatus(),
  });
}

export function useConnectSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ConnectSyncDto) => calendarService.connectSync(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "sync-status"] }),
  });
}

export function useDisconnectSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => calendarService.disconnectSync(provider),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "sync-status"] }),
  });
}

export function useTriggerSync() {
  return useMutation({
    mutationFn: (provider: string) => calendarService.triggerSync(provider),
  });
}

// ── Admin ────────────────────────────────────────────────────────────
export function useCalendarConfigs() {
  return useQuery({
    queryKey: [KEY, "admin", "config"],
    queryFn: () => calendarService.getConfigs(),
  });
}

export function useUpsertConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { key: string; value: string }) => calendarService.upsertConfig(vars.key, vars.value),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "admin", "config"] }),
  });
}

export function useHolidays() {
  return useQuery({
    queryKey: [KEY, "admin", "holidays"],
    queryFn: () => calendarService.listHolidays(),
  });
}

export function useCreateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateHolidayDto) => calendarService.createHoliday(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "admin", "holidays"] }),
  });
}

export function useDeleteHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.deleteHoliday(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "admin", "holidays"] }),
  });
}
