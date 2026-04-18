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
var BulkAssignTaskHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkAssignTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const bulk_assign_task_command_1 = require("./bulk-assign-task.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let BulkAssignTaskHandler = BulkAssignTaskHandler_1 = class BulkAssignTaskHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BulkAssignTaskHandler_1.name);
    }
    async execute(cmd) {
        try {
            if (cmd.roleLevel > 1) {
                throw new common_1.ForbiddenException('Only admins can bulk-assign tasks');
            }
            const updateResult = await this.prisma.working.task.updateMany({
                where: { id: { in: cmd.taskIds }, tenantId: cmd.tenantId, isActive: true },
                data: { assignedToId: cmd.assignedToId },
            });
            await this.prisma.working.taskHistory.createMany({
                data: cmd.taskIds.map((taskId) => ({
                    taskId,
                    action: 'REASSIGNED',
                    field: 'assignedToId',
                    newValue: cmd.assignedToId,
                    changedById: cmd.userId,
                })),
            });
            return { updated: updateResult.count };
        }
        catch (error) {
            this.logger.error(`BulkAssignTaskHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.BulkAssignTaskHandler = BulkAssignTaskHandler;
exports.BulkAssignTaskHandler = BulkAssignTaskHandler = BulkAssignTaskHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(bulk_assign_task_command_1.BulkAssignTaskCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BulkAssignTaskHandler);
//# sourceMappingURL=bulk-assign-task.handler.js.map