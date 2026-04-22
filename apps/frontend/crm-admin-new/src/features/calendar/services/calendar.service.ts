import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  UnifiedCalendarEvent,
  CalendarStats,
  CalendarQueryParams,
  CalendarEvent,
  CreateEventDto,
  RSVPDto,
  RescheduleEventDto,
  AddParticipantDto,
  EventFilters,
  WorkingHours,
  BlockedSlot,
  CreateBlockedSlotDto,
  CheckConflictsDto,
  FindFreeSlotsDto,
  TimeSlot,
  SyncStatus,
  ConnectSyncDto,
  CalendarConfig,
  Holiday,
  CreateHolidayDto,
} from "../types/calendar.types";

const BASE = "/api/v1/calendar";

export const calendarService = {
  // ── Unified / Views ──────────────────────────────────────────
  getUnified: (params: CalendarQueryParams) =>
    apiClient.get<ApiResponse<UnifiedCalendarEvent[]>>(`${BASE}/unified`, { params }).then((r) => r.data),

  getStats: () =>
    apiClient.get<ApiResponse<CalendarStats>>(`${BASE}/stats`).then((r) => r.data),

  getAgenda: (date: string) =>
    apiClient.get<ApiResponse<CalendarEvent[]>>(`${BASE}/agenda`, { params: { date } }).then((r) => r.data),

  getDayView: (date: string) =>
    apiClient.get<ApiResponse<CalendarEvent[]>>(`${BASE}/day/${date}`).then((r) => r.data),

  getWeekView: (date: string) =>
    apiClient.get<ApiResponse<CalendarEvent[]>>(`${BASE}/week/${date}`).then((r) => r.data),

  getMonthView: (year: number, month: number) =>
    apiClient.get<ApiResponse<CalendarEvent[]>>(`${BASE}/month/${year}/${month}`).then((r) => r.data),

  getTeamCalendar: (params?: { userIds?: string; startDate?: string; endDate?: string }) =>
    apiClient.get<ApiResponse<CalendarEvent[]>>(`${BASE}/team`, { params }).then((r) => r.data),

  // ── Event CRUD ───────────────────────────────────────────────
  listEvents: (params?: EventFilters) =>
    apiClient.get<ApiResponse<CalendarEvent[]>>(`${BASE}/events`, { params }).then((r) => r.data),

  getEvent: (id: string) =>
    apiClient.get<ApiResponse<CalendarEvent>>(`${BASE}/events/${id}`).then((r) => r.data),

  createEvent: (dto: CreateEventDto) =>
    apiClient.post<ApiResponse<CalendarEvent>>(`${BASE}/events`, dto).then((r) => r.data),

  updateEvent: (id: string, dto: Partial<CreateEventDto>) =>
    apiClient.put<ApiResponse<CalendarEvent>>(`${BASE}/events/${id}`, dto).then((r) => r.data),

  deleteEvent: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/events/${id}`).then((r) => r.data),

  rescheduleEvent: (id: string, dto: RescheduleEventDto) =>
    apiClient.post<ApiResponse<CalendarEvent>>(`${BASE}/events/${id}/reschedule`, dto).then((r) => r.data),

  addParticipant: (id: string, dto: AddParticipantDto) =>
    apiClient.post<ApiResponse<void>>(`${BASE}/events/${id}/participants`, dto).then((r) => r.data),

  removeParticipant: (id: string, uid: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/events/${id}/participants/${uid}`).then((r) => r.data),

  rsvp: (id: string, dto: RSVPDto) =>
    apiClient.post<ApiResponse<void>>(`${BASE}/events/${id}/rsvp`, dto).then((r) => r.data),

  getEventHistory: (id: string) =>
    apiClient.get<ApiResponse<unknown[]>>(`${BASE}/events/${id}/history`).then((r) => r.data),

  // ── Availability ─────────────────────────────────────────────
  setWorkingHours: (hours: WorkingHours[]) =>
    apiClient.put<ApiResponse<void>>(`${BASE}/availability/working-hours`, { hours }).then((r) => r.data),

  getWorkingHours: () =>
    apiClient.get<ApiResponse<WorkingHours[]>>(`${BASE}/availability/working-hours`).then((r) => r.data),

  getUserWorkingHours: (userId: string) =>
    apiClient.get<ApiResponse<WorkingHours[]>>(`${BASE}/availability/working-hours/${userId}`).then((r) => r.data),

  createBlockedSlot: (dto: CreateBlockedSlotDto) =>
    apiClient.post<ApiResponse<BlockedSlot>>(`${BASE}/availability/blocked-slots`, dto).then((r) => r.data),

  listBlockedSlots: () =>
    apiClient.get<ApiResponse<BlockedSlot[]>>(`${BASE}/availability/blocked-slots`).then((r) => r.data),

  deleteBlockedSlot: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/availability/blocked-slots/${id}`).then((r) => r.data),

  checkConflicts: (dto: CheckConflictsDto) =>
    apiClient.post<ApiResponse<{ conflicts: CalendarEvent[] }>>(`${BASE}/availability/check-conflicts`, dto).then((r) => r.data),

  findFreeSlots: (dto: FindFreeSlotsDto) =>
    apiClient.post<ApiResponse<TimeSlot[]>>(`${BASE}/availability/free-slots`, dto).then((r) => r.data),

  // ── Sync ─────────────────────────────────────────────────────
  connectSync: (dto: ConnectSyncDto) =>
    apiClient.post<ApiResponse<void>>(`${BASE}/sync/connect`, dto).then((r) => r.data),

  disconnectSync: (provider: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/sync/${provider}`).then((r) => r.data),

  triggerSync: (provider: string) =>
    apiClient.post<ApiResponse<void>>(`${BASE}/sync/${provider}/trigger`).then((r) => r.data),

  getSyncStatus: () =>
    apiClient.get<ApiResponse<SyncStatus[]>>(`${BASE}/sync/status`).then((r) => r.data),

  // ── Admin ────────────────────────────────────────────────────
  getConfigs: () =>
    apiClient.get<ApiResponse<CalendarConfig[]>>(`${BASE}/admin/config`).then((r) => r.data),

  getConfig: (key: string) =>
    apiClient.get<ApiResponse<CalendarConfig>>(`${BASE}/admin/config/${key}`).then((r) => r.data),

  upsertConfig: (key: string, value: string) =>
    apiClient.put<ApiResponse<void>>(`${BASE}/admin/config/${key}`, { value }).then((r) => r.data),

  resetConfigs: () =>
    apiClient.post<ApiResponse<void>>(`${BASE}/admin/config/reset`).then((r) => r.data),

  listHolidays: () =>
    apiClient.get<ApiResponse<Holiday[]>>(`${BASE}/admin/holidays`).then((r) => r.data),

  createHoliday: (dto: CreateHolidayDto) =>
    apiClient.post<ApiResponse<Holiday>>(`${BASE}/admin/holidays`, dto).then((r) => r.data),

  deleteHoliday: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`${BASE}/admin/holidays/${id}`).then((r) => r.data),
};
