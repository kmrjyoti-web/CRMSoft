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
var WaWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaWebhookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const wa_conversation_service_1 = require("./wa-conversation.service");
const wa_window_checker_service_1 = require("./wa-window-checker.service");
const wa_entity_linker_service_1 = require("./wa-entity-linker.service");
const wa_chatbot_engine_service_1 = require("./wa-chatbot-engine.service");
let WaWebhookService = WaWebhookService_1 = class WaWebhookService {
    constructor(prisma, conversationService, windowChecker, entityLinker, chatbotEngine) {
        this.prisma = prisma;
        this.conversationService = conversationService;
        this.windowChecker = windowChecker;
        this.entityLinker = entityLinker;
        this.chatbotEngine = chatbotEngine;
        this.logger = new common_1.Logger(WaWebhookService_1.name);
    }
    verifyWebhook(mode, token, challenge, expectedToken) {
        if (mode === 'subscribe' && token === expectedToken) {
            return challenge;
        }
        return null;
    }
    async processWebhook(body) {
        const entries = body?.entry || [];
        for (const entry of entries) {
            const changes = entry?.changes || [];
            for (const change of changes) {
                if (change.field !== 'messages')
                    continue;
                const value = change.value;
                const phoneNumberId = value?.metadata?.phone_number_id;
                if (!phoneNumberId)
                    continue;
                const waba = await this.prisma.working.whatsAppBusinessAccount.findFirst({
                    where: { phoneNumberId },
                });
                if (!waba) {
                    this.logger.warn(`No WABA found for phoneNumberId: ${phoneNumberId}`);
                    continue;
                }
                const messages = value?.messages || [];
                for (const msg of messages) {
                    await this.handleInboundMessage(waba.id, msg, value?.contacts?.[0]);
                }
                const statuses = value?.statuses || [];
                for (const status of statuses) {
                    await this.handleStatusUpdate(status);
                }
            }
        }
    }
    async handleInboundMessage(wabaId, msg, contact) {
        const from = msg.from;
        const contactName = contact?.profile?.name;
        const conversation = await this.conversationService.getOrCreate(wabaId, from, contactName, contactName);
        await this.windowChecker.refreshWindow(conversation.id);
        const messageType = this.mapMessageType(msg.type);
        const messageData = {
            wabaId,
            conversationId: conversation.id,
            waMessageId: msg.id,
            direction: 'INBOUND',
            messageType,
            status: 'DELIVERED',
            deliveredAt: new Date(),
            contextMessageId: msg.context?.id || null,
            isForwarded: msg.context?.forwarded || false,
        };
        switch (msg.type) {
            case 'text':
                messageData.textBody = msg.text?.body;
                break;
            case 'image':
            case 'video':
            case 'audio':
            case 'document':
            case 'sticker':
                messageData.mediaId = msg[msg.type]?.id;
                messageData.mediaMimeType = msg[msg.type]?.mime_type;
                messageData.mediaCaption = msg[msg.type]?.caption;
                messageData.mediaFileName = msg[msg.type]?.filename;
                break;
            case 'location':
                messageData.latitude = msg.location?.latitude;
                messageData.longitude = msg.location?.longitude;
                messageData.locationName = msg.location?.name;
                messageData.locationAddress = msg.location?.address;
                break;
            case 'contacts':
                messageData.messageType = 'CONTACT_CARD';
                messageData.contactCardData = msg.contacts;
                break;
            case 'interactive':
                if (msg.interactive?.type === 'button_reply') {
                    messageData.messageType = 'BUTTON_REPLY';
                    messageData.buttonReplyId = msg.interactive.button_reply?.id;
                    messageData.buttonReplyTitle = msg.interactive.button_reply?.title;
                }
                else if (msg.interactive?.type === 'list_reply') {
                    messageData.messageType = 'LIST_REPLY';
                    messageData.listReplyId = msg.interactive.list_reply?.id;
                    messageData.listReplyTitle = msg.interactive.list_reply?.title;
                }
                break;
            case 'reaction':
                messageData.reactionEmoji = msg.reaction?.emoji;
                messageData.reactionMessageId = msg.reaction?.message_id;
                break;
            case 'order':
                messageData.messageType = 'ORDER';
                messageData.interactiveData = msg.order;
                break;
        }
        const message = await this.prisma.working.waMessage.create({ data: messageData });
        const snippet = messageData.textBody || messageData.mediaCaption || `[${msg.type}]`;
        await this.conversationService.updateLastMessage(conversation.id, snippet.substring(0, 200), 'INBOUND');
        await this.prisma.working.whatsAppBusinessAccount.update({
            where: { id: wabaId },
            data: { totalMessagesReceived: { increment: 1 } },
        });
        if (!conversation.linkedEntityType) {
            await this.entityLinker.autoLinkByPhone(conversation.id, from);
        }
        await this.chatbotEngine.checkAndTrigger(wabaId, conversation.id, message);
    }
    async handleStatusUpdate(status) {
        const waMessageId = status.id;
        const message = await this.prisma.working.waMessage.findFirst({
            where: { waMessageId },
        });
        if (!message)
            return;
        const updateData = {};
        switch (status.status) {
            case 'sent':
                updateData.status = 'SENT';
                updateData.sentAt = new Date(parseInt(status.timestamp) * 1000);
                break;
            case 'delivered':
                updateData.status = 'DELIVERED';
                updateData.deliveredAt = new Date(parseInt(status.timestamp) * 1000);
                break;
            case 'read':
                updateData.status = 'READ';
                updateData.readAt = new Date(parseInt(status.timestamp) * 1000);
                break;
            case 'failed':
                updateData.status = 'FAILED';
                updateData.failedAt = new Date();
                updateData.failureReason = status.errors?.[0]?.message || 'Unknown error';
                break;
        }
        if (Object.keys(updateData).length > 0) {
            await this.prisma.working.waMessage.update({
                where: { id: message.id },
                data: updateData,
            });
        }
        if (message.templateId && ['DELIVERED', 'READ'].includes(updateData.status)) {
            const templateUpdate = {};
            if (updateData.status === 'DELIVERED')
                templateUpdate.deliveredCount = { increment: 1 };
            if (updateData.status === 'READ')
                templateUpdate.readCount = { increment: 1 };
            await this.prisma.working.waTemplate.update({
                where: { id: message.templateId },
                data: templateUpdate,
            });
        }
        if (message.broadcastRecipientId) {
            const recipientUpdate = {};
            if (status.status === 'sent')
                recipientUpdate.status = 'SENT';
            if (status.status === 'delivered') {
                recipientUpdate.status = 'DELIVERED';
                recipientUpdate.deliveredAt = new Date();
            }
            if (status.status === 'read') {
                recipientUpdate.status = 'READ';
                recipientUpdate.readAt = new Date();
            }
            if (status.status === 'failed') {
                recipientUpdate.status = 'FAILED';
                recipientUpdate.failedAt = new Date();
                recipientUpdate.failureReason = status.errors?.[0]?.message;
            }
            if (Object.keys(recipientUpdate).length > 0) {
                await this.prisma.working.waBroadcastRecipient.update({
                    where: { id: message.broadcastRecipientId },
                    data: recipientUpdate,
                });
                if (message.broadcastId) {
                    const broadcastUpdate = {};
                    if (status.status === 'delivered')
                        broadcastUpdate.deliveredCount = { increment: 1 };
                    if (status.status === 'read')
                        broadcastUpdate.readCount = { increment: 1 };
                    if (status.status === 'failed')
                        broadcastUpdate.failedCount = { increment: 1 };
                    if (Object.keys(broadcastUpdate).length > 0) {
                        await this.prisma.working.waBroadcast.update({
                            where: { id: message.broadcastId },
                            data: broadcastUpdate,
                        });
                    }
                }
            }
        }
    }
    mapMessageType(type) {
        const map = {
            text: 'TEXT',
            image: 'IMAGE',
            video: 'VIDEO',
            audio: 'AUDIO',
            document: 'DOCUMENT',
            sticker: 'STICKER',
            location: 'LOCATION',
            contacts: 'CONTACT_CARD',
            interactive: 'INTERACTIVE',
            reaction: 'REACTION',
            order: 'ORDER',
            button: 'BUTTON_REPLY',
        };
        return map[type] || 'UNKNOWN';
    }
};
exports.WaWebhookService = WaWebhookService;
exports.WaWebhookService = WaWebhookService = WaWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wa_conversation_service_1.WaConversationService,
        wa_window_checker_service_1.WaWindowCheckerService,
        wa_entity_linker_service_1.WaEntityLinkerService,
        wa_chatbot_engine_service_1.WaChatbotEngineService])
], WaWebhookService);
//# sourceMappingURL=wa-webhook.service.js.map