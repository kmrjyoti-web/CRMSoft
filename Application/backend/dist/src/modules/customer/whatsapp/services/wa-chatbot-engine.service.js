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
var WaChatbotEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaChatbotEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const wa_api_service_1 = require("./wa-api.service");
let WaChatbotEngineService = WaChatbotEngineService_1 = class WaChatbotEngineService {
    constructor(prisma, waApiService) {
        this.prisma = prisma;
        this.waApiService = waApiService;
        this.logger = new common_1.Logger(WaChatbotEngineService_1.name);
    }
    async checkAndTrigger(wabaId, conversationId, message) {
        const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
            where: { id: conversationId },
        });
        if (conversation.assignedToId)
            return;
        const text = (message.textBody || '').toLowerCase().trim();
        const flows = await this.prisma.working.waChatbotFlow.findMany({
            where: { wabaId, status: 'ACTIVE' },
        });
        let matchedFlow = undefined;
        for (const flow of flows) {
            const keywords = flow.triggerKeywords || [];
            if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
                matchedFlow = flow;
                break;
            }
        }
        if (!matchedFlow) {
            matchedFlow = flows.find(f => f.isDefault);
        }
        if (!matchedFlow)
            return;
        await this.prisma.working.waChatbotFlow.update({
            where: { id: matchedFlow.id },
            data: { triggeredCount: { increment: 1 } },
        });
        await this.executeFlow(wabaId, conversationId, matchedFlow, message);
    }
    async executeFlow(wabaId, conversationId, flow, triggerMessage) {
        const nodes = flow.nodes || [];
        if (nodes.length === 0)
            return;
        const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
            where: { id: conversationId },
        });
        for (const node of nodes) {
            try {
                await this.processNode(wabaId, conversation, node, triggerMessage);
            }
            catch (error) {
                this.logger.error(`Error processing chatbot node ${node.type}: ${error.message}`);
                break;
            }
        }
        await this.prisma.working.waChatbotFlow.update({
            where: { id: flow.id },
            data: { completedCount: { increment: 1 } },
        });
    }
    async processNode(wabaId, conversation, node, triggerMessage) {
        switch (node.type) {
            case 'WELCOME':
            case 'TEXT_REPLY':
                if (node.text) {
                    await this.sendChatbotMessage(wabaId, conversation, node.text);
                }
                break;
            case 'MENU':
            case 'QUICK_BUTTONS':
                if (node.interactiveData) {
                    await this.waApiService.sendInteractive(wabaId, conversation.contactPhone, node.interactiveType || 'button', node.interactiveData);
                    await this.recordChatbotMessage(wabaId, conversation.id, 'INTERACTIVE', '[Menu]');
                }
                break;
            case 'MEDIA_REPLY':
                if (node.mediaUrl) {
                    await this.waApiService.sendMedia(wabaId, conversation.contactPhone, node.mediaType || 'image', node.mediaUrl, node.caption);
                    await this.recordChatbotMessage(wabaId, conversation.id, 'IMAGE', node.caption || '[Media]');
                }
                break;
            case 'ASSIGN_AGENT':
                if (node.assignToUserId) {
                    await this.prisma.working.waConversation.update({
                        where: { id: conversation.id },
                        data: { assignedToId: node.assignToUserId },
                    });
                }
                break;
            case 'DELAY':
                if (node.delayMs) {
                    await new Promise(resolve => setTimeout(resolve, node.delayMs));
                }
                break;
            case 'TAG_CONTACT':
                if (node.tag) {
                    await this.prisma.working.waConversation.update({
                        where: { id: conversation.id },
                        data: { tags: { push: node.tag } },
                    });
                }
                break;
            case 'COLLECT_INPUT':
                if (node.promptText) {
                    await this.sendChatbotMessage(wabaId, conversation, node.promptText);
                }
                break;
            case 'CONDITION':
                this.logger.debug(`Condition node evaluation for conversation ${conversation.id}`);
                break;
            case 'API_CALL':
                this.logger.debug(`API call node for conversation ${conversation.id}: ${node.url}`);
                break;
            case 'LINK_LEAD':
                this.logger.debug(`Link lead node for conversation ${conversation.id}`);
                break;
        }
    }
    async sendChatbotMessage(wabaId, conversation, text) {
        await this.waApiService.sendText(wabaId, conversation.contactPhone, text);
        await this.recordChatbotMessage(wabaId, conversation.id, 'TEXT', text);
    }
    async recordChatbotMessage(wabaId, conversationId, type, snippet) {
        await this.prisma.working.waMessage.create({
            data: {
                wabaId,
                conversationId,
                direction: 'OUTBOUND',
                messageType: type,
                status: 'SENT',
                textBody: type === 'TEXT' ? snippet : null,
                sentAt: new Date(),
                isChatbotReply: true,
            },
        });
    }
};
exports.WaChatbotEngineService = WaChatbotEngineService;
exports.WaChatbotEngineService = WaChatbotEngineService = WaChatbotEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wa_api_service_1.WaApiService])
], WaChatbotEngineService);
//# sourceMappingURL=wa-chatbot-engine.service.js.map