export type ReminderStatus = 'PENDING' | 'DISMISSED' | 'SNOOZED' | 'CANCELLED' | 'ACKNOWLEDGED';
export type ReminderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ReminderChannel = 'EMAIL' | 'NOTIFICATION' | 'SMS' | 'WHATSAPP';

export interface Reminder {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  remindAt: string;
  status: ReminderStatus;
  priority: ReminderPriority;
  channels: ReminderChannel[];
  userId: string;
  userName?: string;
  snoozedUntil?: string;
  acknowledgedAt?: string;
  dismissedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderStats {
  pending: number;
  snoozed: number;
  overdueCount: number;
  todayCount: number;
  thisWeekCount: number;
}

export interface ManagerReminderStats {
  teamTotal: number;
  teamOverdue: number;
  byUser: { userId: string; userName: string; pending: number; overdue: number }[];
}

export interface CreateReminderDto {
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  remindAt: string;
  priority?: ReminderPriority;
  channels?: ReminderChannel[];
  userId?: string;
}

export interface SnoozeReminderDto {
  snoozeDuration: number; // minutes
}

export interface ReminderFilters {
  page?: number;
  limit?: number;
  status?: ReminderStatus;
  priority?: ReminderPriority;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
}
