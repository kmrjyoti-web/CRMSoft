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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckMissedRemindersHandler = exports.ProcessTaskRecurrenceHandler = exports.CheckTaskEscalationsHandler = exports.CheckOverdueTasksHandler = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CheckOverdueTasksHandler = class CheckOverdueTasksHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'CHECK_OVERDUE_TASKS';
    }
    async execute() {
        const now = new Date();
        const result = await this.prisma.working.task.updateMany({
            where: {
                isActive: true,
                status: { in: ['OPEN', 'IN_PROGRESS'] },
                dueDate: { lt: now },
            },
            data: { status: 'OVERDUE' },
        });
        if (result.count > 0) {
            const overdueTasks = await this.prisma.working.task.findMany({
                where: { isActive: true, status: 'OVERDUE', dueDate: { lt: now } },
                select: { id: true, createdById: true },
                take: result.count,
            });
            await this.prisma.working.taskHistory.createMany({
                data: overdueTasks.map(t => ({
                    taskId: t.id,
                    field: 'status',
                    oldValue: 'IN_PROGRESS',
                    newValue: 'OVERDUE',
                    changedById: t.createdById,
                })),
            });
        }
        return { recordsProcessed: result.count };
    }
};
exports.CheckOverdueTasksHandler = CheckOverdueTasksHandler;
exports.CheckOverdueTasksHandler = CheckOverdueTasksHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckOverdueTasksHandler);
let CheckTaskEscalationsHandler = class CheckTaskEscalationsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'CHECK_TASK_ESCALATIONS';
    }
    async execute() {
        const rules = await this.prisma.working.escalationRule.findMany({
            where: { isActive: true, entityType: 'task' },
        });
        let escalated = 0;
        for (const rule of rules) {
            const thresholdDate = new Date(Date.now() - rule.triggerAfterHours * 60 * 60 * 1000);
            const overdueTasks = await this.prisma.working.task.findMany({
                where: {
                    isActive: true,
                    status: { in: ['OVERDUE'] },
                    dueDate: { lt: thresholdDate },
                },
                include: {
                    assignedTo: { select: { id: true, reportingToId: true, firstName: true, lastName: true } },
                },
                take: 50,
            });
            for (const task of overdueTasks) {
                try {
                    if (rule.action === 'NOTIFY_MANAGER' && task.assignedTo?.reportingToId) {
                        await this.prisma.working.notification.create({
                            data: {
                                category: 'SYSTEM_ALERT',
                                title: `Escalation: Task ${task.taskNumber} overdue`,
                                message: `Task "${task.title}" assigned to ${task.assignedTo.firstName} ${task.assignedTo.lastName} is overdue and has been escalated.`,
                                recipientId: task.assignedTo.reportingToId,
                                entityType: 'task',
                                entityId: task.id,
                                priority: 'HIGH',
                            },
                        });
                        escalated++;
                    }
                    else if (rule.action === 'AUTO_CLOSE') {
                        await this.prisma.working.task.update({ where: { id: task.id }, data: { status: 'CANCELLED' } });
                        escalated++;
                    }
                }
                catch (error) {
                }
            }
        }
        return { recordsProcessed: escalated };
    }
};
exports.CheckTaskEscalationsHandler = CheckTaskEscalationsHandler;
exports.CheckTaskEscalationsHandler = CheckTaskEscalationsHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckTaskEscalationsHandler);
let ProcessTaskRecurrenceHandler = class ProcessTaskRecurrenceHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'PROCESS_TASK_RECURRENCE';
    }
    async execute() {
        const completedRecurring = await this.prisma.working.task.findMany({
            where: {
                status: 'COMPLETED',
                recurrence: { not: 'NONE' },
                nextRecurrenceDate: { lte: new Date() },
                isActive: true,
            },
            take: 100,
        });
        let created = 0;
        for (const task of completedRecurring) {
            try {
                const nextDue = this.calculateNextDate(task.nextRecurrenceDate || task.dueDate || new Date(), task.recurrence);
                if (!nextDue)
                    continue;
                const count = await this.prisma.working.task.count({ where: { tenantId: task.tenantId } });
                const taskNumber = `TSK-${String(count + 1).padStart(4, '0')}`;
                await this.prisma.working.task.create({
                    data: {
                        tenantId: task.tenantId,
                        taskNumber,
                        title: task.title,
                        description: task.description,
                        type: task.type,
                        priority: task.priority,
                        recurrence: task.recurrence,
                        dueDate: nextDue,
                        nextRecurrenceDate: this.calculateNextDate(nextDue, task.recurrence),
                        entityType: task.entityType,
                        entityId: task.entityId,
                        assignedToId: task.assignedToId,
                        createdById: task.createdById,
                    },
                });
                await this.prisma.working.task.update({
                    where: { id: task.id },
                    data: { nextRecurrenceDate: null },
                });
                created++;
            }
            catch (_) { }
        }
        return { recordsProcessed: completedRecurring.length, recordsSucceeded: created };
    }
    calculateNextDate(fromDate, recurrence) {
        if (recurrence === 'NONE')
            return null;
        const next = new Date(fromDate);
        switch (recurrence) {
            case 'DAILY':
                next.setDate(next.getDate() + 1);
                break;
            case 'WEEKLY':
                next.setDate(next.getDate() + 7);
                break;
            case 'BIWEEKLY':
                next.setDate(next.getDate() + 14);
                break;
            case 'MONTHLY':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'QUARTERLY':
                next.setMonth(next.getMonth() + 3);
                break;
        }
        return next;
    }
};
exports.ProcessTaskRecurrenceHandler = ProcessTaskRecurrenceHandler;
exports.ProcessTaskRecurrenceHandler = ProcessTaskRecurrenceHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcessTaskRecurrenceHandler);
let CheckMissedRemindersHandler = class CheckMissedRemindersHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'CHECK_MISSED_REMINDERS';
    }
    async execute() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const result = await this.prisma.working.reminder.updateMany({
            where: {
                isActive: true,
                status: 'PENDING',
                scheduledAt: { lt: oneHourAgo },
            },
            data: { status: 'MISSED', missedAt: new Date() },
        });
        return { recordsProcessed: result.count };
    }
};
exports.CheckMissedRemindersHandler = CheckMissedRemindersHandler;
exports.CheckMissedRemindersHandler = CheckMissedRemindersHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckMissedRemindersHandler);
//# sourceMappingURL=task-handlers.js.map