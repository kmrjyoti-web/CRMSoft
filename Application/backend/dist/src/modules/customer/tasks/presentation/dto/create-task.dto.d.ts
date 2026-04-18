export declare class CreateTaskDto {
    title: string;
    description?: string;
    assignedToId?: string;
    type?: string;
    customTaskType?: string;
    priority?: string;
    assignmentScope?: string;
    assignedDepartmentId?: string;
    assignedDesignationId?: string;
    assignedRoleId?: string;
    dueDate?: string;
    dueTime?: string;
    startDate?: string;
    recurrence?: string;
    recurrenceConfig?: Record<string, unknown>;
    parentTaskId?: string;
    entityType?: string;
    entityId?: string;
    tags?: string[];
    attachments?: Record<string, unknown>[];
    customFields?: Record<string, unknown>;
    estimatedMinutes?: number;
    reminderMinutesBefore?: number;
    activityType?: string;
    leadId?: string;
}
