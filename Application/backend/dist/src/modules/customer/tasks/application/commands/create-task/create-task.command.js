"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskCommand = void 0;
class CreateTaskCommand {
    constructor(title, createdById, creatorRoleLevel, tenantId, assignedToId, description, type, customTaskType, priority, assignmentScope, assignedDepartmentId, assignedDesignationId, assignedRoleId, dueDate, dueTime, startDate, recurrence, recurrenceConfig, parentTaskId, entityType, entityId, tags, attachments, customFields, estimatedMinutes, reminderMinutesBefore, activityType, leadId) {
        this.title = title;
        this.createdById = createdById;
        this.creatorRoleLevel = creatorRoleLevel;
        this.tenantId = tenantId;
        this.assignedToId = assignedToId;
        this.description = description;
        this.type = type;
        this.customTaskType = customTaskType;
        this.priority = priority;
        this.assignmentScope = assignmentScope;
        this.assignedDepartmentId = assignedDepartmentId;
        this.assignedDesignationId = assignedDesignationId;
        this.assignedRoleId = assignedRoleId;
        this.dueDate = dueDate;
        this.dueTime = dueTime;
        this.startDate = startDate;
        this.recurrence = recurrence;
        this.recurrenceConfig = recurrenceConfig;
        this.parentTaskId = parentTaskId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.tags = tags;
        this.attachments = attachments;
        this.customFields = customFields;
        this.estimatedMinutes = estimatedMinutes;
        this.reminderMinutesBefore = reminderMinutesBefore;
        this.activityType = activityType;
        this.leadId = leadId;
    }
}
exports.CreateTaskCommand = CreateTaskCommand;
//# sourceMappingURL=create-task.command.js.map