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
var ToggleChatbotFlowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleChatbotFlowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const toggle_chatbot_flow_command_1 = require("./toggle-chatbot-flow.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ToggleChatbotFlowHandler = ToggleChatbotFlowHandler_1 = class ToggleChatbotFlowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ToggleChatbotFlowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const flow = await this.prisma.working.waChatbotFlow.update({
                where: { id: cmd.flowId },
                data: { status: cmd.status },
            });
            this.logger.log(`Chatbot flow ${flow.id} status changed to ${cmd.status}`);
            return flow;
        }
        catch (error) {
            this.logger.error(`ToggleChatbotFlowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ToggleChatbotFlowHandler = ToggleChatbotFlowHandler;
exports.ToggleChatbotFlowHandler = ToggleChatbotFlowHandler = ToggleChatbotFlowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(toggle_chatbot_flow_command_1.ToggleChatbotFlowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ToggleChatbotFlowHandler);
//# sourceMappingURL=toggle-chatbot-flow.handler.js.map