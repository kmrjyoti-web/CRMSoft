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
var RemoveTransitionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveTransitionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const remove_transition_command_1 = require("./remove-transition.command");
let RemoveTransitionHandler = RemoveTransitionHandler_1 = class RemoveTransitionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RemoveTransitionHandler_1.name);
    }
    async execute(cmd) {
        try {
            const t = await this.prisma.workflowTransition.findUnique({ where: { id: cmd.transitionId } });
            if (!t)
                throw new common_1.NotFoundException(`Transition "${cmd.transitionId}" not found`);
            await this.prisma.workflowTransition.delete({ where: { id: cmd.transitionId } });
            return { deleted: true };
        }
        catch (error) {
            this.logger.error(`RemoveTransitionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RemoveTransitionHandler = RemoveTransitionHandler;
exports.RemoveTransitionHandler = RemoveTransitionHandler = RemoveTransitionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(remove_transition_command_1.RemoveTransitionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemoveTransitionHandler);
//# sourceMappingURL=remove-transition.handler.js.map