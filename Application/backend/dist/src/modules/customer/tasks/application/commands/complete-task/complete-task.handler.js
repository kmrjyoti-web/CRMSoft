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
var CompleteTaskHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const complete_task_command_1 = require("./complete-task.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const task_recurrence_service_1 = require("../../services/task-recurrence.service");
const common_1 = require("@nestjs/common");
let CompleteTaskHandler = CompleteTaskHandler_1 = class CompleteTaskHandler {
    constructor(prisma, recurrenceService) {
        this.prisma = prisma;
        this.recurrenceService = recurrenceService;
        this.logger = new common_1.Logger(CompleteTaskHandler_1.name);
    }
    async execute(cmd) {
        try {
            const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
            if (!task || !task.isActive)
                throw new common_1.NotFoundException('Task not found');
            const data = {
                status: 'COMPLETED',
                completedAt: new Date(),
            };
            if (cmd.completionNotes !== undefined)
                data.completionNotes = cmd.completionNotes;
            if (cmd.actualMinutes !== undefined)
                data.actualMinutes = cmd.actualMinutes;
            const updated = await this.prisma.working.task.update({
                where: { id: cmd.taskId },
                data,
                include: {
                    assignedTo: { select: { id: true, firstName: true, lastName: true } },
                    createdBy: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            await this.prisma.working.taskHistory.create({
                data: {
                    taskId: cmd.taskId,
                    action: 'STATUS_CHANGED',
                    field: 'status',
                    oldValue: task.status,
                    newValue: 'COMPLETED',
                    changedById: cmd.userId,
                },
            });
            if (task.recurrence && task.recurrence !== 'NONE') {
                await this.recurrenceService.processRecurringTasks();
            }
            return updated;
        }
        catch (error) {
            this.logger.error(`CompleteTaskHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CompleteTaskHandler = CompleteTaskHandler;
exports.CompleteTaskHandler = CompleteTaskHandler = CompleteTaskHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(complete_task_command_1.CompleteTaskCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        task_recurrence_service_1.TaskRecurrenceService])
], CompleteTaskHandler);
//# sourceMappingURL=complete-task.handler.js.map