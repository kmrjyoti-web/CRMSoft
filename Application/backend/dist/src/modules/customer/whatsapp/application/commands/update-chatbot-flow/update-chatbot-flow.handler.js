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
var UpdateChatbotFlowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChatbotFlowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_chatbot_flow_command_1 = require("./update-chatbot-flow.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateChatbotFlowHandler = UpdateChatbotFlowHandler_1 = class UpdateChatbotFlowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateChatbotFlowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const updateData = {};
            if (cmd.name !== undefined)
                updateData.name = cmd.name;
            if (cmd.triggerKeywords !== undefined)
                updateData.triggerKeywords = cmd.triggerKeywords;
            if (cmd.nodes !== undefined)
                updateData.nodes = cmd.nodes;
            const flow = await this.prisma.working.waChatbotFlow.update({
                where: { id: cmd.flowId },
                data: updateData,
            });
            this.logger.log(`Chatbot flow updated: ${flow.id}`);
            return flow;
        }
        catch (error) {
            this.logger.error(`UpdateChatbotFlowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateChatbotFlowHandler = UpdateChatbotFlowHandler;
exports.UpdateChatbotFlowHandler = UpdateChatbotFlowHandler = UpdateChatbotFlowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_chatbot_flow_command_1.UpdateChatbotFlowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateChatbotFlowHandler);
//# sourceMappingURL=update-chatbot-flow.handler.js.map