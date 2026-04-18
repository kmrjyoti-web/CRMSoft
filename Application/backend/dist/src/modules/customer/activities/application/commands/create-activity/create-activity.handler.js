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
var CreateActivityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateActivityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_activity_command_1 = require("./create-activity.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const channel_router_service_1 = require("../../../../../core/work/notifications/services/channel-router.service");
const reminder_utils_1 = require("../../../../../../common/utils/reminder.utils");
const calendar_colors_1 = require("../../../../../../common/utils/calendar-colors");
const error_utils_1 = require("../../../../../../common/utils/error.utils");
let CreateActivityHandler = CreateActivityHandler_1 = class CreateActivityHandler {
    constructor(prisma, channelRouter) {
        this.prisma = prisma;
        this.channelRouter = channelRouter;
        this.logger = new common_1.Logger(CreateActivityHandler_1.name);
    }
    async execute(cmd) {
        const activity = await this.prisma.working.activity.create({
            data: {
                tenantId: cmd.tenantId || '',
                type: cmd.type,
                subject: cmd.subject,
                description: cmd.description,
                scheduledAt: cmd.scheduledAt,
                endTime: cmd.endTime,
                duration: cmd.duration,
                leadId: cmd.leadId,
                contactId: cmd.contactId,
                locationName: cmd.locationName,
                latitude: cmd.latitude,
                longitude: cmd.longitude,
                createdById: cmd.userId,
            },
            include: { lead: true, contact: true, createdByUser: true },
        });
        if (cmd.scheduledAt && cmd.reminderMinutesBefore != null) {
            const task = await this.createLinkedTask(cmd, activity.id);
            await this.createLinkedReminder(cmd, task.id, activity.id);
        }
        else if (cmd.scheduledAt) {
            await (0, reminder_utils_1.createAutoReminder)(this.prisma, {
                entityType: 'ACTIVITY',
                entityId: activity.id,
                eventDate: new Date(cmd.scheduledAt),
                title: cmd.subject,
                recipientId: cmd.userId,
                createdById: cmd.userId,
            });
        }
        if (cmd.taggedUserIds?.length) {
            await this.handleTaggedUsers(cmd, activity);
        }
        if (cmd.scheduledAt) {
            await this.syncCalendarEvent(cmd, activity.id);
        }
        return activity;
    }
    async createLinkedTask(cmd, activityId) {
        const tenantId = cmd.tenantId || '';
        const lastTask = await this.prisma.working.task.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            select: { taskNumber: true },
        });
        const nextNum = lastTask?.taskNumber
            ? parseInt(lastTask.taskNumber.replace('TSK-', ''), 10) + 1
            : 1;
        const taskNumber = `TSK-${String(nextNum).padStart(4, '0')}`;
        const task = await this.prisma.working.task.create({
            data: {
                tenantId,
                taskNumber,
                title: `Activity Reminder: ${cmd.subject}`,
                description: cmd.description,
                type: 'ACTIVITY_LINKED',
                status: 'OPEN',
                priority: 'MEDIUM',
                dueDate: cmd.scheduledAt ? new Date(cmd.scheduledAt) : undefined,
                entityType: 'activity',
                entityId: activityId,
                assignedToId: cmd.userId,
                createdById: cmd.userId,
            },
        });
        await this.prisma.working.taskWatcher.create({
            data: { taskId: task.id, userId: cmd.userId },
        });
        await this.prisma.working.taskHistory.create({
            data: {
                taskId: task.id,
                field: 'status',
                oldValue: null,
                newValue: 'OPEN',
                changedById: cmd.userId,
            },
        });
        this.logger.log(`Auto-created task ${taskNumber} for activity ${activityId}`);
        return task;
    }
    async createLinkedReminder(cmd, taskId, activityId) {
        const scheduledAt = new Date(cmd.scheduledAt);
        const reminderTime = new Date(scheduledAt.getTime() - (cmd.reminderMinutesBefore * 60 * 1000));
        await this.prisma.working.reminder.create({
            data: {
                title: `Reminder: ${cmd.subject}`,
                entityType: 'ACTIVITY',
                entityId: activityId,
                scheduledAt: reminderTime,
                recipientId: cmd.userId,
                createdById: cmd.userId,
                status: 'PENDING',
                type: 'ACTIVITY_LINKED',
                taskId,
            },
        });
        this.logger.log(`Auto-created reminder for task ${taskId}, ${cmd.reminderMinutesBefore} min before activity`);
    }
    async handleTaggedUsers(cmd, activity) {
        const creator = await this.prisma.user.findUnique({
            where: { id: cmd.userId },
            select: { firstName: true, lastName: true },
        });
        const creatorName = creator ? `${creator.firstName} ${creator.lastName}`.trim() : 'Someone';
        for (const taggedUserId of cmd.taggedUserIds) {
            if (taggedUserId === cmd.userId)
                continue;
            const linkedTask = await this.prisma.working.task.findFirst({
                where: { entityType: 'activity', entityId: activity.id, isActive: true },
            });
            if (linkedTask) {
                await this.prisma.working.taskWatcher.upsert({
                    where: { taskId_userId: { taskId: linkedTask.id, userId: taggedUserId } },
                    create: { taskId: linkedTask.id, userId: taggedUserId },
                    update: {},
                });
            }
            try {
                await this.channelRouter.send({
                    templateName: 'activity_tagged',
                    recipientId: taggedUserId,
                    senderId: cmd.userId,
                    variables: {
                        taggerName: creatorName,
                        activityType: cmd.type,
                        activitySubject: cmd.subject,
                        scheduledAt: cmd.scheduledAt ? new Date(cmd.scheduledAt).toLocaleString() : 'N/A',
                    },
                    entityType: 'activity',
                    entityId: activity.id,
                });
            }
            catch (error) {
                this.logger.warn(`Failed to send ACTIVITY_TAGGED notification to ${taggedUserId}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            }
        }
    }
    async syncCalendarEvent(cmd, activityId) {
        const existingEvent = await this.prisma.working.calendarEvent.findFirst({
            where: { eventType: 'ACTIVITY', sourceId: activityId },
        });
        if (existingEvent) {
            await this.prisma.working.calendarEvent.update({
                where: { id: existingEvent.id },
                data: {
                    title: cmd.subject,
                    startTime: new Date(cmd.scheduledAt),
                    endTime: cmd.endTime ? new Date(cmd.endTime) : undefined,
                },
            });
        }
        else {
            await this.prisma.working.calendarEvent.create({
                data: {
                    eventType: 'ACTIVITY',
                    sourceId: activityId,
                    title: cmd.subject,
                    description: cmd.description,
                    startTime: new Date(cmd.scheduledAt),
                    endTime: cmd.endTime ? new Date(cmd.endTime) : undefined,
                    color: calendar_colors_1.CALENDAR_COLORS[cmd.type] || calendar_colors_1.CALENDAR_COLORS.CALL,
                    userId: cmd.userId,
                },
            });
        }
    }
};
exports.CreateActivityHandler = CreateActivityHandler;
exports.CreateActivityHandler = CreateActivityHandler = CreateActivityHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_activity_command_1.CreateActivityCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        channel_router_service_1.ChannelRouterService])
], CreateActivityHandler);
//# sourceMappingURL=create-activity.handler.js.map