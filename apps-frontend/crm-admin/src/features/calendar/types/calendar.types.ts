export type CalendarSource =
  | 'TASK'
  | 'ACTIVITY'
  | 'DEMO'
  | 'TOUR_PLAN'
  | 'REMINDER'
  | 'FOLLOW_UP'
  | 'SCHEDULED_EVENT';

export interface UnifiedCalendarEvent {
  id: string;
  source: CalendarSource;
  sourceId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  allDay: boolean;
  color?: string;
  userId: string;
  userName?: string;
  location?: string;
  meetingLink?: string;
  entityType?: string;
  entityId?: string;
  status?: string;
  priority?: string;
  editable: boolean;
}

export interface CalendarStats {
  todayEvents: number;
  weekEvents: number;
  overdueTasks: number;
  pendingRsvps: number;
}

export interface CalendarQueryParams {
  startDate: string;
  endDate: string;
  sources?: CalendarSource[];
  userId?: string;
  search?: string;
}

export const SOURCE_LABELS: Record<CalendarSource, string> = {
  TASK: 'Task',
  ACTIVITY: 'Activity',
  DEMO: 'Demo',
  TOUR_PLAN: 'Tour Plan',
  REMINDER: 'Reminder',
  FOLLOW_UP: 'Follow-up',
  SCHEDULED_EVENT: 'Event',
};

export const SOURCE_COLORS: Record<CalendarSource, string> = {
  TASK: '#4A90D9',
  ACTIVITY: '#27AE60',
  DEMO: '#E67E22',
  TOUR_PLAN: '#8E44AD',
  REMINDER: '#E74C3C',
  FOLLOW_UP: '#F39C12',
  SCHEDULED_EVENT: '#2C3E50',
};

// ── Calendar Events CRUD ──────────────────────────────────────────────
export type EventType = 'MEETING' | 'CALL' | 'DEMO' | 'TASK' | 'REMINDER' | 'BLOCK' | 'OTHER';
export type RSVPStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
export type SyncProvider = 'GOOGLE' | 'OUTLOOK' | 'ICAL';

export interface CalendarEvent {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  type: EventType;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  timezone: string;
  isRecurring: boolean;
  recurrenceId?: string;
  location?: string;
  meetingUrl?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  organizerId: string;
  organizerName: string;
  attendees: EventAttendee[];
  reminders: EventReminder[];
  isCancelled: boolean;
  externalId?: string;
  syncProvider?: SyncProvider;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  userId?: string;
  email: string;
  name: string;
  rsvpStatus: RSVPStatus;
  isOptional: boolean;
}

export interface EventReminder {
  type: 'EMAIL' | 'NOTIFICATION' | 'SMS';
  minutesBefore: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface SyncStatus {
  provider: SyncProvider;
  isConnected: boolean;
  lastSyncAt?: string;
  syncError?: string;
  email?: string;
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorkDay: boolean;
}

export interface BlockedSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  type: EventType;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  timezone?: string;
  location?: string;
  meetingUrl?: string;
  entityType?: string;
  entityId?: string;
  attendees?: Omit<EventAttendee, 'rsvpStatus'>[];
  reminders?: EventReminder[];
}

export interface RSVPDto {
  status: RSVPStatus;
  comment?: string;
}

export interface RescheduleEventDto {
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface AddParticipantDto {
  userId?: string;
  email: string;
  name: string;
  isOptional?: boolean;
}

export interface CheckConflictsDto {
  userIds: string[];
  startTime: string;
  endTime: string;
}

export interface FindFreeSlotsDto {
  userIds: string[];
  dateFrom: string;
  dateTo: string;
  durationMinutes: number;
}

export interface CreateBlockedSlotDto {
  title: string;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
}

export interface ConnectSyncDto {
  provider: SyncProvider;
  authCode: string;
}

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  type?: EventType;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CalendarConfig {
  key: string;
  value: string;
  description?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
}

export interface CreateHolidayDto {
  name: string;
  date: string;
  isRecurring?: boolean;
}
