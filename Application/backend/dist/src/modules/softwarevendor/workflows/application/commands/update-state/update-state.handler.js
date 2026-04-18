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
var UpdateStateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStateHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const update_state_command_1 = require("./update-state.command");
let UpdateStateHandler = UpdateStateHandler_1 = class UpdateStateHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateStateHandler_1.name);
    }
    async execute(cmd) {
        try {
            const state = await this.prisma.workflowState.findUnique({ where: { id: cmd.stateId } });
            if (!state)
                throw new common_1.NotFoundException(`State "${cmd.stateId}" not found`);
            return this.prisma.workflowState.update({ where: { id: cmd.stateId }, data: cmd.data });
        }
        catch (error) {
            this.logger.error(`UpdateStateHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateStateHandler = UpdateStateHandler;
exports.UpdateStateHandler = UpdateStateHandler = UpdateStateHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_state_command_1.UpdateStateCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateStateHandler);
//# sourceMappingURL=update-state.handler.js.map