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
var RollbackTransitionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollbackTransitionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const rollback_transition_command_1 = require("./rollback-transition.command");
let RollbackTransitionHandler = RollbackTransitionHandler_1 = class RollbackTransitionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RollbackTransitionHandler_1.name);
    }
    async execute(cmd) {
        try {
            const instance = await this.prisma.workflowInstance.findUnique({
                where: { id: cmd.instanceId },
                include: { currentState: true, previousState: true },
            });
            if (!instance)
                throw new common_1.NotFoundException(`Instance "${cmd.instanceId}" not found`);
            if (!instance.isActive)
                throw new common_1.BadRequestException('Cannot rollback completed instance');
            if (!instance.previousStateId)
                throw new common_1.BadRequestException('No previous state to rollback to');
            const user = await this.prisma.user.findUnique({
                where: { id: cmd.userId }, select: { firstName: true, lastName: true },
            });
            await this.prisma.workflowInstance.update({
                where: { id: cmd.instanceId },
                data: {
                    currentStateId: instance.previousStateId,
                    previousStateId: instance.currentStateId,
                },
            });
            const history = await this.prisma.workflowHistory.create({
                data: {
                    instanceId: cmd.instanceId,
                    fromStateId: instance.currentStateId,
                    toStateId: instance.previousStateId,
                    action: 'ROLLBACK',
                    performedById: cmd.userId,
                    performedByName: user ? `${user.firstName} ${user.lastName}` : cmd.userId,
                    comment: cmd.comment,
                },
            });
            return { instanceId: cmd.instanceId, rolledBackTo: instance.previousState?.code, historyId: history.id };
        }
        catch (error) {
            this.logger.error(`RollbackTransitionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RollbackTransitionHandler = RollbackTransitionHandler;
exports.RollbackTransitionHandler = RollbackTransitionHandler = RollbackTransitionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(rollback_transition_command_1.RollbackTransitionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RollbackTransitionHandler);
//# sourceMappingURL=rollback-transition.handler.js.map