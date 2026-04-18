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
var DeleteTaskHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const delete_task_command_1 = require("./delete-task.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let DeleteTaskHandler = DeleteTaskHandler_1 = class DeleteTaskHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteTaskHandler_1.name);
    }
    async execute(cmd) {
        try {
            const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
            if (!task || !task.isActive)
                throw new common_1.NotFoundException('Task not found');
            return this.prisma.working.task.update({
                where: { id: cmd.taskId },
                data: { isActive: false },
            });
        }
        catch (error) {
            this.logger.error(`DeleteTaskHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteTaskHandler = DeleteTaskHandler;
exports.DeleteTaskHandler = DeleteTaskHandler = DeleteTaskHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_task_command_1.DeleteTaskCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteTaskHandler);
//# sourceMappingURL=delete-task.handler.js.map