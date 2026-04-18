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
var RemoveStateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveStateHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const remove_state_command_1 = require("./remove-state.command");
let RemoveStateHandler = RemoveStateHandler_1 = class RemoveStateHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RemoveStateHandler_1.name);
    }
    async execute(cmd) {
        try {
            const state = await this.prisma.workflowState.findUnique({ where: { id: cmd.stateId } });
            if (!state)
                throw new common_1.NotFoundException(`State "${cmd.stateId}" not found`);
            const usedInTransitions = await this.prisma.workflowTransition.count({
                where: { OR: [{ fromStateId: cmd.stateId }, { toStateId: cmd.stateId }] },
            });
            if (usedInTransitions > 0)
                throw new common_1.BadRequestException('Cannot delete state used in transitions');
            const usedInInstances = await this.prisma.workflowInstance.count({ where: { currentStateId: cmd.stateId } });
            if (usedInInstances > 0)
                throw new common_1.BadRequestException('Cannot delete state used by active instances');
            await this.prisma.workflowState.delete({ where: { id: cmd.stateId } });
            return { deleted: true };
        }
        catch (error) {
            this.logger.error(`RemoveStateHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RemoveStateHandler = RemoveStateHandler;
exports.RemoveStateHandler = RemoveStateHandler = RemoveStateHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(remove_state_command_1.RemoveStateCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemoveStateHandler);
//# sourceMappingURL=remove-state.handler.js.map