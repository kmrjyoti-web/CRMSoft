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
var ApproveTaskHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const approve_task_command_1 = require("./approve-task.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const calendar_colors_1 = require("../../../../../../common/utils/calendar-colors");
const error_utils_1 = require("../../../../../../common/utils/error.utils");
let ApproveTaskHandler = ApproveTaskHandler_1 = class ApproveTaskHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ApproveTaskHandler_1.name);
    }
    async execute(cmd) {
        const existing = await this.prisma.working.task.findUnique({
            where: { id: cmd.id },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!existing)
            throw new common_1.NotFoundException('Task not found');
        if (existing.status !== 'PENDING_APPROVAL') {
            throw new common_1.BadRequestException('Task is not pending approval');
        }
        const task = await this.prisma.working.task.update({
            where: { id: cmd.id },
            data: {
                status: 'OPEN',
                approvedById: cmd.userId,
                approvedAt: new Date(),
            },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        await this.prisma.working.taskHistory.create({
            data: {
                tenantId: cmd.tenantId,
                taskId: cmd.id,
                action: 'STATUS_CHANGED',
                field: 'status',
                oldValue: 'PENDING_APPROVAL',
                newValue: 'OPEN',
                changedById: cmd.userId,
            },
        });
        await this.autoCreateActivity(existing, cmd);
        if (existing.dueDate) {
            await this.syncCalendarEvent(existing, cmd);
        }
        return task;
    }
    async autoCreateActivity(task, cmd) {
        try {
            const activityType = this.mapTaskTypeToActivityType(task.type);
            await this.prisma.working.activity.create({
                data: {
                    tenantId: cmd.tenantId || '',
                    type: activityType,
                    subject: task.title,
                    description: task.description,
                    scheduledAt: task.dueDate,
                    leadId: task.entityType === 'LEAD' ? task.entityId : undefined,
                    createdById: cmd.userId,
                },
            });
            this.logger.log(`Auto-created activity on approval for task ${task.taskNumber}`);
        }
        catch (error) {
            this.logger.warn(`Failed to auto-create activity on approval for task ${task.taskNumber}: ${(0, error_utils_1.getErrorMessage)(error)}`);
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
    async syncCalendarEvent(task, cmd) {
        try {
            const existing = await this.prisma.working.calendarEvent.findFirst({
                where: { eventType: 'TASK', sourceId: task.id },
            });
            if (!existing) {
                await this.prisma.working.calendarEvent.create({
                    data: {
                        eventType: 'TASK',
                        sourceId: task.id,
                        title: task.title,
                        description: task.description,
                        startTime: task.dueDate,
                        color: calendar_colors_1.CALENDAR_COLORS.TASK || '#F97316',
                        userId: task.assignedToId || task.createdById,
                    },
                });
            }
        }
        catch (error) {
            this.logger.warn(`Failed to sync calendar on approval for task ${task.taskNumber}: ${(0, error_utils_1.getErrorMessage)(error)}`);
        }
    }
};
exports.ApproveTaskHandler = ApproveTaskHandler;
exports.ApproveTaskHandler = ApproveTaskHandler = ApproveTaskHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(approve_task_command_1.ApproveTaskCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApproveTaskHandler);
//# sourceMappingURL=approve-task.handler.js.map