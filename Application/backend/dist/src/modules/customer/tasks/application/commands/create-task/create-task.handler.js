"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CreateTaskHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_task_command_1 = require("./create-task.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const task_assignment_service_1 = require("../../services/task-assignment.service");
const task_recurrence_service_1 = require("../../services/task-recurrence.service");
const calendar_colors_1 = require("../../../../../../common/utils/calendar-colors");
const error_utils_1 = require("../../../../../../common/utils/error.utils");
let CreateTaskHandler = CreateTaskHandler_1 = class CreateTaskHandler {
    constructor(prisma, assignmentService, recurrenceService) {
        this.prisma = prisma;
        this.assignmentService = assignmentService;
        this.recurrenceService = recurrenceService;
        this.logger = new common_1.Logger(CreateTaskHandler_1.name);
    }
    async execute(cmd) {
        const scope = cmd.assignmentScope || 'SPECIFIC_USER';
        if (cmd.assignedToId && cmd.assignedToId !== cmd.createdById) {
            await this.assignmentService.validateAssignment(cmd.createdById, cmd.assignedToId, cmd.creatorRoleLevel, scope, cmd.assignedDepartmentId, cmd.assignedDesignationId, cmd.assignedRoleId);
        }
        const count = await this.prisma.working.task.count({ where: { tenantId: cmd.tenantId } });
        const taskNumber = `TSK-${String(count + 1).padStart(4, '0')}`;
        const recurrence = cmd.recurrence || 'NONE';
        const dueDate = cmd.dueDate ? new Date(cmd.dueDate) : null;
        const nextRecurrenceDate = dueDate && recurrence !== 'NONE'
            ? this.recurrenceService.calculateNextDate(dueDate, recurrence)
            : null;
        const entityType = cmd.leadId ? 'LEAD' : cmd.entityType;
        const entityId = cmd.leadId || cmd.entityId;
        const assigneeId = cmd.assignedToId || cmd.createdById;
        const isSelfTask = assigneeId === cmd.createdById;
        const isNonManager = cmd.creatorRoleLevel >= 4;
        const initialStatus = (isSelfTask && isNonManager) ? 'PENDING_APPROVAL' : 'OPEN';
        const task = await this.prisma.working.task.create({
            data: {
                tenantId: cmd.tenantId,
                taskNumber,
                title: cmd.title,
                description: cmd.description,
                type: cmd.type || 'GENERAL',
                customTaskType: cmd.customTaskType,
                status: initialStatus,
                priority: cmd.priority || 'MEDIUM',
                assignmentScope: scope,
                assignedToId: assigneeId,
                assignedDepartmentId: cmd.assignedDepartmentId,
                assignedDesignationId: cmd.assignedDesignationId,
                assignedRoleId: cmd.assignedRoleId,
                dueDate,
                dueTime: cmd.dueTime,
                startDate: cmd.startDate ? new Date(cmd.startDate) : null,
                recurrence,
                recurrenceConfig: cmd.recurrenceConfig,
                nextRecurrenceDate,
                parentTaskId: cmd.parentTaskId,
                entityType,
                entityId,
                tags: cmd.tags,
                attachments: cmd.attachments,
                customFields: cmd.customFields,
                estimatedMinutes: cmd.estimatedMinutes,
                createdById: cmd.createdById,
            },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (cmd.createdById !== assigneeId) {
            await this.prisma.working.taskWatcher.create({
                data: { taskId: task.id, userId: cmd.createdById },
            });
        }
        await this.prisma.working.taskHistory.create({
            data: {
                tenantId: cmd.tenantId,
                taskId: task.id,
                action: 'CREATED',
                field: 'status',
                oldValue: null,
                newValue: initialStatus,
                changedById: cmd.createdById,
            },
        });
        if (initialStatus === 'OPEN') {
            await this.autoCreateActivity(cmd, task);
        }
        if (dueDate && cmd.reminderMinutesBefore != null) {
            await this.createLinkedReminder(cmd, task.id, dueDate);
        }
        if (dueDate) {
            await this.syncCalendarEvent(cmd, task, dueDate);
        }
        return task;
    }
    async autoCreateActivity(cmd, task) {
        try {
            const activityType = cmd.activityType || this.mapTaskTypeToActivityType(cmd.type);
            const activity = await this.prisma.working.activity.create({
                data: {
                    tenantId: cmd.tenantId || '',
                    type: activityType,
                    subject: cmd.title,
                    description: cmd.description,
                    scheduledAt: cmd.dueDate ? new Date(cmd.dueDate) : undefined,
                    leadId: cmd.leadId || (cmd.entityType === 'LEAD' ? cmd.entityId : undefined),
                    createdById: cmd.createdById,
                },
            });
            this.logger.log(`Auto-created activity ${activity.id} for task ${task.taskNumber}`);
        }
        catch (error) {
            this.logger.warn(`Failed to auto-create activity for task ${task.taskNumber}: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
    mapTaskTypeToActivityType(taskType) {
        const mapping = {
            CALL_BACK: 'CALL',
            MEETING: 'MEETING',
            DEMO: 'MEETING',
            FOLLOW_UP: 'CALL',
            REVIEW: 'NOTE',
        };
        return mapping[taskType || ''] || 'NOTE';
    }
    async createLinkedReminder(cmd, taskId, dueDate) {
        try {
            const reminderTime = new Date(dueDate.getTime() - (cmd.reminderMinutesBefore * 60 * 1000));
            await this.prisma.working.reminder.create({
                data: {
                    title: `Reminder: ${cmd.title}`,
                    entityType: 'TASK',
                    entityId: taskId,
                    scheduledAt: reminderTime,
                    recipientId: cmd.assignedToId || cmd.createdById,
                    createdById: cmd.createdById,
                    status: 'PENDING',
                    type: 'TASK_LINKED',
                    taskId,
                },
            });
            this.logger.log(`Auto-created reminder for task ${taskId}, ${cmd.reminderMinutesBefore} min before due`);
        }
        catch (error) {
            this.logger.warn(`Failed to create reminder for task ${taskId}: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
    async syncCalendarEvent(cmd, task, dueDate) {
        try {
            await this.prisma.working.calendarEvent.create({
                data: {
                    eventType: 'TASK',
                    sourceId: task.id,
                    title: cmd.title,
                    description: cmd.description,
                    startTime: dueDate,
                    color: calendar_colors_1.CALENDAR_COLORS.TASK || '#F97316',
                    userId: cmd.assignedToId || cmd.createdById,
                },
            });
            this.logger.log(`Auto-created calendar event for task ${task.taskNumber}`);
        }
        catch (error) {
            this.logger.warn(`Failed to sync calendar for task ${task.taskNumber}: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
};
exports.CreateTaskHandler = CreateTaskHandler;
exports.CreateTaskHandler = CreateTaskHandler = CreateTaskHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_task_command_1.CreateTaskCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        task_assignment_service_1.TaskAssignmentService,
        task_recurrence_service_1.TaskRecurrenceService])
], CreateTaskHandler);
//# sourceMappingURL=create-task.handler.js.map