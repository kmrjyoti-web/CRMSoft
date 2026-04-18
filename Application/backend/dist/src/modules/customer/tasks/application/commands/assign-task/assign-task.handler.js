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
var AssignTaskHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const assign_task_command_1 = require("./assign-task.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const task_assignment_service_1 = require("../../services/task-assignment.service");
const common_1 = require("@nestjs/common");
let AssignTaskHandler = AssignTaskHandler_1 = class AssignTaskHandler {
    constructor(prisma, assignmentService) {
        this.prisma = prisma;
        this.assignmentService = assignmentService;
        this.logger = new common_1.Logger(AssignTaskHandler_1.name);
    }
    async execute(cmd) {
        try {
            const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
            if (!task || !task.isActive)
                throw new common_1.NotFoundException('Task not found');
            await this.assignmentService.validateAssignment(cmd.userId, cmd.newAssigneeId, cmd.userRoleLevel);
            const updated = await this.prisma.working.task.update({
                where: { id: cmd.taskId },
                data: { assignedToId: cmd.newAssigneeId },
                include: {
                    assignedTo: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            await this.prisma.working.taskHistory.create({
                data: {
                    taskId: cmd.taskId,
                    field: 'assignedToId',
                    oldValue: task.assignedToId,
                    newValue: cmd.newAssigneeId,
                    changedById: cmd.userId,
                },
            });
            return updated;
        }
        catch (error) {
            this.logger.error(`AssignTaskHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AssignTaskHandler = AssignTaskHandler;
exports.AssignTaskHandler = AssignTaskHandler = AssignTaskHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(assign_task_command_1.AssignTaskCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        task_assignment_service_1.TaskAssignmentService])
], AssignTaskHandler);
//# sourceMappingURL=assign-task.handler.js.map