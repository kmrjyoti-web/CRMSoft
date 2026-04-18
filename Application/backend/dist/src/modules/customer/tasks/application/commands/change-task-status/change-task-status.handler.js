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
var ChangeTaskStatusHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeTaskStatusHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const change_task_status_command_1 = require("./change-task-status.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const task_logic_service_1 = require("../../../../../customer/task-logic/task-logic.service");
const common_1 = require("@nestjs/common");
const DEFAULT_TRANSITIONS = {
    OPEN: ['IN_PROGRESS', 'CANCELLED', 'ON_HOLD'],
    IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
    ON_HOLD: ['OPEN', 'IN_PROGRESS', 'CANCELLED'],
    OVERDUE: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
};
let ChangeTaskStatusHandler = ChangeTaskStatusHandler_1 = class ChangeTaskStatusHandler {
    constructor(prisma, taskLogic) {
        this.prisma = prisma;
        this.taskLogic = taskLogic;
        this.logger = new common_1.Logger(ChangeTaskStatusHandler_1.name);
    }
    async execute(cmd) {
        try {
            const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
            if (!task || !task.isActive)
                throw new common_1.NotFoundException('Task not found');
            const transitions = (await this.taskLogic.getConfig('STATUS_TRANSITIONS')) || DEFAULT_TRANSITIONS;
            const allowed = transitions[task.status] || [];
            if (!allowed.includes(cmd.newStatus)) {
                throw new common_1.BadRequestException(`Cannot transition from ${task.status} to ${cmd.newStatus}. Allowed: ${allowed.join(', ')}`);
            }
            const data = { status: cmd.newStatus };
            if (cmd.newStatus === 'COMPLETED') {
                data.completedAt = new Date();
            }
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
                    field: 'status',
                    oldValue: task.status,
                    newValue: cmd.newStatus,
                    changedById: cmd.userId,
                },
            });
            return updated;
        }
        catch (error) {
            this.logger.error(`ChangeTaskStatusHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ChangeTaskStatusHandler = ChangeTaskStatusHandler;
exports.ChangeTaskStatusHandler = ChangeTaskStatusHandler = ChangeTaskStatusHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(change_task_status_command_1.ChangeTaskStatusCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        task_logic_service_1.TaskLogicService])
], ChangeTaskStatusHandler);
//# sourceMappingURL=change-task-status.handler.js.map