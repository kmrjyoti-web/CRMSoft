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
var UpdateTransitionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTransitionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const update_transition_command_1 = require("./update-transition.command");
let UpdateTransitionHandler = UpdateTransitionHandler_1 = class UpdateTransitionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateTransitionHandler_1.name);
    }
    async execute(cmd) {
        try {
            const t = await this.prisma.workflowTransition.findUnique({ where: { id: cmd.transitionId } });
            if (!t)
                throw new common_1.NotFoundException(`Transition "${cmd.transitionId}" not found`);
            return this.prisma.workflowTransition.update({ where: { id: cmd.transitionId }, data: cmd.data });
        }
        catch (error) {
            this.logger.error(`UpdateTransitionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTransitionHandler = UpdateTransitionHandler;
exports.UpdateTransitionHandler = UpdateTransitionHandler = UpdateTransitionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_transition_command_1.UpdateTransitionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateTransitionHandler);
//# sourceMappingURL=update-transition.handler.js.map