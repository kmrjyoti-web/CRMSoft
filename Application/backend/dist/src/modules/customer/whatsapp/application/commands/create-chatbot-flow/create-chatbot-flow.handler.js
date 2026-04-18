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
var CreateChatbotFlowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChatbotFlowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_chatbot_flow_command_1 = require("./create-chatbot-flow.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let CreateChatbotFlowHandler = CreateChatbotFlowHandler_1 = class CreateChatbotFlowHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateChatbotFlowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const flow = await this.prisma.working.waChatbotFlow.create({
                data: {
                    wabaId: cmd.wabaId,
                    name: cmd.name,
                    triggerKeywords: cmd.triggerKeywords,
                    nodes: cmd.nodes,
                    status: 'DRAFT',
                    createdById: cmd.userId,
                },
            });
            this.logger.log(`Chatbot flow created: ${flow.id} (${cmd.name}) for WABA ${cmd.wabaId}`);
            return flow;
        }
        catch (error) {
            this.logger.error(`CreateChatbotFlowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateChatbotFlowHandler = CreateChatbotFlowHandler;
exports.CreateChatbotFlowHandler = CreateChatbotFlowHandler = CreateChatbotFlowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_chatbot_flow_command_1.CreateChatbotFlowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateChatbotFlowHandler);
//# sourceMappingURL=create-chatbot-flow.handler.js.map