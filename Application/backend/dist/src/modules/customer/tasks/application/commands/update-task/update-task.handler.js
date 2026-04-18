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
var UpdateTaskHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const update_task_command_1 = require("./update-task.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let UpdateTaskHandler = UpdateTaskHandler_1 = class UpdateTaskHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateTaskHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
            if (!existing || !existing.isActive)
                throw new common_1.NotFoundException('Task not found');
            const changes = {};
            const history = [];
            if (cmd.title && cmd.title !== existing.title) {
                changes.title = cmd.title;
                history.push({ field: 'title', oldValue: existing.title, newValue: cmd.title });
            }
            if (cmd.description !== undefined && cmd.description !== existing.description) {
                changes.description = cmd.description;
            }
            if (cmd.priority && cmd.priority !== existing.priority) {
                changes.priority = cmd.priority;
                history.push({ field: 'priority', oldValue: existing.priority, newValue: cmd.priority });
            }
            if (cmd.dueDate) {
                const newDue = new Date(cmd.dueDate);
                changes.dueDate = newDue;
                history.push({ field: 'dueDate', oldValue: existing.dueDate?.toISOString() || null, newValue: newDue.toISOString() });
            }
            if (cmd.recurrence && cmd.recurrence !== existing.recurrence) {
                changes.recurrence = cmd.recurrence;
                history.push({ field: 'recurrence', oldValue: existing.recurrence, newValue: cmd.recurrence });
            }
            if (Object.keys(changes).length === 0)
                return existing;
            const task = await this.prisma.working.task.update({
                where: { id: cmd.taskId },
                data: changes,
                include: {
                    assignedTo: { select: { id: true, firstName: true, lastName: true } },
                    createdBy: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            if (history.length > 0) {
                await this.prisma.working.taskHistory.createMany({
                    data: history.map(h => ({
                        taskId: cmd.taskId,
                        field: h.field,
                        oldValue: h.oldValue,
                        newValue: h.newValue,
                        changedById: cmd.userId,
                    })),
                });
            }
            return task;
        }
        catch (error) {
            this.logger.error(`UpdateTaskHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTaskHandler = UpdateTaskHandler;
exports.UpdateTaskHandler = UpdateTaskHandler = UpdateTaskHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_task_command_1.UpdateTaskCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateTaskHandler);
//# sourceMappingURL=update-task.handler.js.map