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
var PublishWorkflowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishWorkflowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const publish_workflow_command_1 = require("./publish-workflow.command");
let PublishWorkflowHandler = PublishWorkflowHandler_1 = class PublishWorkflowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PublishWorkflowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const workflow = await this.prisma.workflow.findUnique({
                where: { id: cmd.id },
                include: { states: true, transitions: true },
            });
            if (!workflow)
                throw new common_1.NotFoundException(`Workflow "${cmd.id}" not found`);
            const initialStates = workflow.states.filter((s) => s.stateType === 'INITIAL');
            if (initialStates.length !== 1)
                throw new common_1.BadRequestException('Workflow must have exactly one INITIAL state');
            const terminalStates = workflow.states.filter((s) => s.stateType === 'TERMINAL');
            if (terminalStates.length === 0)
                throw new common_1.BadRequestException('Workflow must have at least one TERMINAL state');
            return this.prisma.workflow.update({
                where: { id: cmd.id },
                data: { version: { increment: 1 }, isActive: true },
            });
        }
        catch (error) {
            this.logger.error(`PublishWorkflowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.PublishWorkflowHandler = PublishWorkflowHandler;
exports.PublishWorkflowHandler = PublishWorkflowHandler = PublishWorkflowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(publish_workflow_command_1.PublishWorkflowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublishWorkflowHandler);
//# sourceMappingURL=publish-workflow.handler.js.map