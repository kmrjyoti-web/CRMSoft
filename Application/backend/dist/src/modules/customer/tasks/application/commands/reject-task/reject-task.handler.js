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
var RejectTaskHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reject_task_command_1 = require("./reject-task.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let RejectTaskHandler = RejectTaskHandler_1 = class RejectTaskHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RejectTaskHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.working.task.findUnique({ where: { id: cmd.id } });
            if (!existing)
                throw new common_1.NotFoundException('Task not found');
            if (existing.status !== 'PENDING_APPROVAL') {
                throw new common_1.BadRequestException('Task is not pending approval');
            }
            const task = await this.prisma.working.task.update({
                where: { id: cmd.id },
                data: {
                    status: 'CANCELLED',
                    rejectedReason: cmd.reason,
                },
                include: {
                    assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
                    createdBy: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            await this.prisma.working.taskHistory.create({
                data: {
                    tenantId: existing.tenantId,
                    taskId: cmd.id,
                    action: 'STATUS_CHANGED',
                    field: 'status',
                    oldValue: 'PENDING_APPROVAL',
                    newValue: 'CANCELLED',
                    changedById: cmd.userId,
                },
            });
            return task;
        }
        catch (error) {
            this.logger.error(`RejectTaskHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RejectTaskHandler = RejectTaskHandler;
exports.RejectTaskHandler = RejectTaskHandler = RejectTaskHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reject_task_command_1.RejectTaskCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RejectTaskHandler);
//# sourceMappingURL=reject-task.handler.js.map