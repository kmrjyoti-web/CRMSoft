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
var TaskRecurrenceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRecurrenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../../common/utils/error.utils");
let TaskRecurrenceService = TaskRecurrenceService_1 = class TaskRecurrenceService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TaskRecurrenceService_1.name);
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
    async processRecurringTasks() {
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
            catch (error) {
                this.logger.error(`Failed to create recurrence for task ${task.id}: ${(0, error_utils_1.getErrorMessage)(error)}`);
            }
        }
        return created;
    }
};
exports.TaskRecurrenceService = TaskRecurrenceService;
exports.TaskRecurrenceService = TaskRecurrenceService = TaskRecurrenceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskRecurrenceService);
//# sourceMappingURL=task-recurrence.service.js.map