export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD' | 'OVERDUE' | 'PENDING_APPROVAL';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
export type TaskType =
  | 'GENERAL'
  | 'FOLLOW_UP'
  | 'REMINDER'
  | 'ACTIVITY_LINKED'
  | 'APPROVAL'
  | 'REVIEW'
  | 'CALL_BACK'
  | 'MEETING'
  | 'DEMO'
  | 'CUSTOM';

export interface TaskListItem {
  id: string;
  taskNumber: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  entityType?: string;
  entityId?: string;
  tags?: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedTo?: { id: string; firstName: string; lastName: string };
  createdBy?: { id: string; firstName: string; lastName: string };
}

export interface TaskDetail extends TaskListItem {
  customTaskType?: string;
  assignmentScope?: string;
  recurrence?: string;
  recurrenceConfig?: Record<string, unknown>;
  attachments?: Record<string, unknown>[];
  customFields?: Record<string, unknown>;
  completionNotes?: string;
  approvedById?: string;
  approvedAt?: string;
  rejectedReason?: string;
  history?: TaskHistoryItem[];
  watchers?: { id: string; firstName: string; lastName: string }[];
}

export interface TaskHistoryItem {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface TaskCreateData {
  title: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  assignedToId?: string;
  dueDate?: string;
  dueTime?: string;
  startDate?: string;
  entityType?: string;
  entityId?: string;
  tags?: string[];
  estimatedMinutes?: number;
  reminderMinutesBefore?: number;
  activityType?: string;
  leadId?: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  tags?: string[];
  estimatedMinutes?: number;
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
