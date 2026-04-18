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
var WaMessageSenderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaMessageSenderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const wa_api_service_1 = require("./wa-api.service");
const wa_conversation_service_1 = require("./wa-conversation.service");
const wa_window_checker_service_1 = require("./wa-window-checker.service");
let WaMessageSenderService = WaMessageSenderService_1 = class WaMessageSenderService {
    constructor(prisma, waApiService, conversationService, windowChecker) {
        this.prisma = prisma;
        this.waApiService = waApiService;
        this.conversationService = conversationService;
        this.windowChecker = windowChecker;
        this.logger = new common_1.Logger(WaMessageSenderService_1.name);
    }
    async sendText(wabaId, conversationId, text, senderUserId) {
        const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
            where: { id: conversationId },
        });
        await this.checkOptOut(wabaId, conversation.contactPhone);
        this.ensureWindowOpen(conversation.windowExpiresAt);
        const result = await this.waApiService.sendText(wabaId, conversation.contactPhone, text);
        const message = await this.prisma.working.waMessage.create({
            data: {
                wabaId,
                conversationId,
                waMessageId: result.messages?.[0]?.id,
                direction: 'OUTBOUND',
                messageType: 'TEXT',
                status: 'SENT',
                textBody: text,
                sentAt: new Date(),
                senderUserId,
            },
        });
        await this.conversationService.updateLastMessage(conversationId, text.substring(0, 200), 'OUTBOUND');
        await this.incrementWabaSent(wabaId);
        return message;
    }
    async sendTemplate(wabaId, conversationId, templateId, variables, senderUserId) {
        const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
            where: { id: conversationId },
        });
        const template = await this.prisma.working.waTemplate.findUniqueOrThrow({
            where: { id: templateId },
        });
        await this.checkOptOut(wabaId, conversation.contactPhone);
        const components = variables ? this.buildTemplateComponents(variables) : undefined;
        const result = await this.waApiService.sendTemplate(wabaId, conversation.contactPhone, template.name, template.language, components);
        const message = await this.prisma.working.waMessage.create({
            data: {
                wabaId,
                conversationId,
                waMessageId: result.messages?.[0]?.id,
                direction: 'OUTBOUND',
                messageType: 'TEMPLATE',
                status: 'SENT',
                templateId: template.id,
                templateName: template.name,
                templateVariables: variables,
                sentAt: new Date(),
                senderUserId,
            },
        });
        await this.conversationService.updateLastMessage(conversationId, `[Template: ${template.name}]`, 'OUTBOUND');
        await this.incrementWabaSent(wabaId);
        await this.prisma.working.waTemplate.update({
            where: { id: templateId },
            data: { sentCount: { increment: 1 } },
        });
        return message;
    }
    async sendMedia(wabaId, conversationId, type, mediaUrl, caption, senderUserId) {
        const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
            where: { id: conversationId },
        });
        await this.checkOptOut(wabaId, conversation.contactPhone);
        this.ensureWindowOpen(conversation.windowExpiresAt);
        const result = await this.waApiService.sendMedia(wabaId, conversation.contactPhone, type, mediaUrl, caption);
        const message = await this.prisma.working.waMessage.create({
            data: {
                wabaId,
                conversationId,
                waMessageId: result.messages?.[0]?.id,
                direction: 'OUTBOUND',
                messageType: type.toUpperCase(),
                status: 'SENT',
                mediaUrl,
                mediaCaption: caption,
                sentAt: new Date(),
                senderUserId,
            },
        });
        await this.conversationService.updateLastMessage(conversationId, caption || `[${type}]`, 'OUTBOUND');
        await this.incrementWabaSent(wabaId);
        return message;
    }
    async sendInteractive(wabaId, conversationId, interactiveType, interactiveData, senderUserId) {
        const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
            where: { id: conversationId },
        });
        await this.checkOptOut(wabaId, conversation.contactPhone);
        this.ensureWindowOpen(conversation.windowExpiresAt);
        const result = await this.waApiService.sendInteractive(wabaId, conversation.contactPhone, interactiveType, interactiveData);
        const message = await this.prisma.working.waMessage.create({
            data: {
                wabaId,
                conversationId,
                waMessageId: result.messages?.[0]?.id,
                direction: 'OUTBOUND',
                messageType: 'INTERACTIVE',
                status: 'SENT',
                interactiveType,
                interactiveData,
                sentAt: new Date(),
                senderUserId,
            },
        });
        await this.conversationService.updateLastMessage(conversationId, '[Interactive message]', 'OUTBOUND');
        await this.incrementWabaSent(wabaId);
        return message;
    }
    async sendLocation(wabaId, conversationId, lat, lng, name, address, senderUserId) {
        const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
            where: { id: conversationId },
        });
        await this.checkOptOut(wabaId, conversation.contactPhone);
        this.ensureWindowOpen(conversation.windowExpiresAt);
        const result = await this.waApiService.sendLocation(wabaId, conversation.contactPhone, lat, lng, name, address);
        const message = await this.prisma.working.waMessage.create({
            data: {
                wabaId,
                conversationId,
                waMessageId: result.messages?.[0]?.id,
                direction: 'OUTBOUND',
                messageType: 'LOCATION',
                status: 'SENT',
                latitude: lat,
                longitude: lng,
                locationName: name,
                locationAddress: address,
                sentAt: new Date(),
                senderUserId,
            },
        });
        await this.conversationService.updateLastMessage(conversationId, name || '[Location]', 'OUTBOUND');
        await this.incrementWabaSent(wabaId);
        return message;
    }
    async checkOptOut(wabaId, phoneNumber) {
        const optOut = await this.prisma.working.waOptOut.findFirst({
            where: { wabaId, phoneNumber },
        });
        if (optOut) {
            throw new common_1.BadRequestException('Contact has opted out of WhatsApp messages');
        }
    }
    ensureWindowOpen(windowExpiresAt) {
        if (!this.windowChecker.isWindowOpen(windowExpiresAt)) {
            throw new common_1.BadRequestException('24-hour messaging window is closed. Use a template message instead.');
        }
    }
    buildTemplateComponents(variables) {
        const components = [];
        if (variables.header) {
            components.push({ type: 'header', parameters: variables.header });
        }
        if (variables.body) {
            components.push({
                type: 'body',
                parameters: variables.body.map((v) => ({ type: 'text', text: v })),
            });
        }
        if (variables.buttons) {
            components.push(...variables.buttons);
        }
        return components;
    }
    async incrementWabaSent(wabaId) {
        await this.prisma.working.whatsAppBusinessAccount.update({
            where: { id: wabaId },
            data: { totalMessagesSent: { increment: 1 } },
        });
    }
};
exports.WaMessageSenderService = WaMessageSenderService;
exports.WaMessageSenderService = WaMessageSenderService = WaMessageSenderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wa_api_service_1.WaApiService,
        wa_conversation_service_1.WaConversationService,
        wa_window_checker_service_1.WaWindowCheckerService])
], WaMessageSenderService);
//# sourceMappingURL=wa-message-sender.service.js.map