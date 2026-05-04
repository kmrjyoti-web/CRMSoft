// ── Enums ────────────────────────────────────────────────

export type FollowUpStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "SNOOZED";
export type FollowUpPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ── Entities ─────────────────────────────────────────────

export interface FollowUp {
  id: string;
  title: string;
  description?: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  assignedToId: string;
  assignedTo?: { id: string; firstName: string; lastName: string };
  dueDate: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  completedAt?: string;
  completedBy?: string;
  completionNotes?: string;
  snoozeCount: number;
  snoozedUntil?: string;
  lastSnoozedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpStats {
  total: number;
  overdue: number;
  today: number;
  upcoming: number;
  completed: number;
}

// ── DTOs ─────────────────────────────────────────────────

export interface CreateFollowUpDto {
  title: string;
  description?: string;
  entityType: string;
  entityId: string;
  assignedToId: string;
  dueDate: string;
  priority?: FollowUpPriority;
}

export interface SnoozeFollowUpDto {
  snoozedUntil: string;
  reason?: string;
}

export interface ReassignFollowUpDto {
  newAssigneeId: string;
  reason?: string;
}

export interface CompleteFollowUpDto {
  completionNotes?: string;
}

export interface FollowUpFilters {
  status?: FollowUpStatus;
  priority?: FollowUpPriority;
  assignedToId?: string;
  entityType?: string;
  entityId?: string;
  isOverdue?: boolean;
  page?: number;
  limit?: number;
}
