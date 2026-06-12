// ── Enums ────────────────────────────────────────────────

export type NotificationCategory =
  | "LEAD_ASSIGNED"
  | "LEAD_UPDATED"
  | "OWNERSHIP_CHANGED"
  | "DEMO_SCHEDULED"
  | "DEMO_COMPLETED"
  | "FOLLOW_UP_DUE"
  | "FOLLOW_UP_OVERDUE"
  | "QUOTATION_SENT"
  | "QUOTATION_APPROVED"
  | "TOUR_PLAN_APPROVED"
  | "ACTIVITY_REMINDER"
  | "DELEGATION_STARTED"
  | "DELEGATION_ENDED"
  | "SYSTEM_ALERT"
  | "WORKFLOW_ACTION";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type NotificationStatus = "UNREAD" | "READ" | "DISMISSED" | "ARCHIVED";
export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | "CALL";
export type DigestFrequency = "REALTIME" | "HOURLY" | "DAILY" | "WEEKLY" | "NONE";

export type NotificationEventType =
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "TASK_COMPLETED"
  | "TASK_OVERDUE"
  | "TASK_COMMENT"
  | "TASK_COMMENT_ADDED"
  | "REMINDER_DUE"
  | "REMINDER_TRIGGERED"
  | "REMINDER_MISSED"
  | "LEAD_ASSIGNED"
  | "LEAD_STATUS_CHANGED"
  | "LEAD_COMMENT_ADDED"
  | "LEAD_FOLLOW_UP_DUE"
  | "LEAD_WON"
  | "LEAD_LOST"
  | "ACTIVITY_TAGGED"
  | "ACTIVITY_REMINDER"
  | "COMMENT_ADDED"
  | "COMMENT_PRIVATE"
  | "APPROVAL_REQUIRED";

// ── Entities ─────────────────────────────────────────────

export interface Notification {
  id: string;
  tenantId: string;
  category: NotificationCategory;
  eventType: NotificationEventType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  channel: NotificationChannel;
  entityType?: string;
  entityId?: string;
  recipientId: string;
  senderId?: string;
  groupKey?: string;
  isGrouped: boolean;
  groupCount: number;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  dismissedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  channels: Record<string, boolean>;
  categories: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestFrequency: DigestFrequency;
  timezone: string;
  isActive: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  dismissed: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

// ── Query Params ─────────────────────────────────────────

export interface NotificationListParams {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  status?: NotificationStatus;
  priority?: NotificationPriority;
}

// ── Mutation DTOs ────────────────────────────────────────

export interface UpdatePreferencesDto {
  channels?: Record<string, boolean>;
  categories?: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestFrequency?: DigestFrequency;
  timezone?: string;
}

// ── SSE Event ────────────────────────────────────────────

export interface SSENotificationEvent {
  type: string;
  data: Notification;
}

// ── Admin Config ────────────────────────────────────────

export interface NotificationConfig {
  id: string;
  eventType: string;
  channels: NotificationChannel[];
  templateId?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationRule {
  id: string;
  entityType: string;
  triggerAfterHours: number;
  action: string;
  targetRoleLevel?: number;
  isActive: boolean;
}
