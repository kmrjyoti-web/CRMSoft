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
var WaBroadcastExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaBroadcastExecutorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const wa_api_service_1 = require("./wa-api.service");
let WaBroadcastExecutorService = WaBroadcastExecutorService_1 = class WaBroadcastExecutorService {
    constructor(prisma, waApiService) {
        this.prisma = prisma;
        this.waApiService = waApiService;
        this.logger = new common_1.Logger(WaBroadcastExecutorService_1.name);
    }
    async executeBroadcast(broadcastId) {
        const broadcast = await this.prisma.working.waBroadcast.findUniqueOrThrow({
            where: { id: broadcastId },
            include: { template: true },
        });
        if (!['DRAFT', 'SCHEDULED'].includes(broadcast.status)) {
            throw new common_1.BadRequestException(`Broadcast is in ${broadcast.status} status, cannot start`);
        }
        await this.prisma.working.waBroadcast.update({
            where: { id: broadcastId },
            data: { status: 'SENDING', startedAt: new Date() },
        });
        try {
            const recipients = await this.prisma.working.waBroadcastRecipient.findMany({
                where: { broadcastId, status: 'PENDING' },
            });
            const phoneNumbers = recipients.map(r => r.phoneNumber);
            const optOuts = await this.prisma.working.waOptOut.findMany({
                where: { wabaId: broadcast.wabaId, phoneNumber: { in: phoneNumbers } },
            });
            const optedOutPhones = new Set(optOuts.map(o => o.phoneNumber));
            let sentCount = 0;
            let failedCount = 0;
            let optOutCount = 0;
            for (const recipient of recipients) {
                const current = await this.prisma.working.waBroadcast.findUnique({ where: { id: broadcastId } });
                if (current?.status === 'PAUSED' || current?.status === 'CANCELLED')
                    break;
                if (optedOutPhones.has(recipient.phoneNumber)) {
                    await this.prisma.working.waBroadcastRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'OPTED_OUT' },
                    });
                    optOutCount++;
                    continue;
                }
                try {
                    const variables = recipient.variables || {};
                    const components = this.buildComponents(variables);
                    const result = await this.waApiService.sendTemplate(broadcast.wabaId, recipient.phoneNumber, broadcast.template.name, broadcast.template.language, components.length > 0 ? components : undefined);
                    const message = await this.prisma.working.waMessage.create({
                        data: {
                            wabaId: broadcast.wabaId,
                            conversationId: await this.getOrCreateConversationId(broadcast.wabaId, recipient.phoneNumber, recipient.contactName),
                            waMessageId: result.messages?.[0]?.id,
                            direction: 'OUTBOUND',
                            messageType: 'TEMPLATE',
                            status: 'SENT',
                            templateId: broadcast.templateId,
                            templateName: broadcast.template.name,
                            templateVariables: variables,
                            sentAt: new Date(),
                            broadcastId,
                            broadcastRecipientId: recipient.id,
                        },
                    });
                    await this.prisma.working.waBroadcastRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'SENT', sentAt: new Date(), waMessageId: message.waMessageId },
                    });
                    sentCount++;
                }
                catch (error) {
                    await this.prisma.working.waBroadcastRecipient.update({
                        where: { id: recipient.id },
                        data: { status: 'FAILED', failedAt: new Date(), failureReason: error.message },
                    });
                    failedCount++;
                }
                if (broadcast.throttlePerSecond > 0) {
                    const delayMs = Math.ceil(1000 / broadcast.throttlePerSecond);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            const finalStatus = failedCount === recipients.length ? 'FAILED' : 'COMPLETED';
            await this.prisma.working.waBroadcast.update({
                where: { id: broadcastId },
                data: {
                    status: finalStatus,
                    completedAt: new Date(),
                    sentCount,
                    failedCount,
                    optOutCount,
                },
            });
        }
        catch (error) {
            await this.prisma.working.waBroadcast.update({
                where: { id: broadcastId },
                data: { status: 'FAILED' },
            });
            this.logger.error(`Broadcast ${broadcastId} failed: ${error.message}`);
        }
    }
    async pauseBroadcast(broadcastId) {
        await this.prisma.working.waBroadcast.update({
            where: { id: broadcastId },
            data: { status: 'PAUSED' },
        });
    }
    async cancelBroadcast(broadcastId) {
        await this.prisma.working.waBroadcast.update({
            where: { id: broadcastId },
            data: { status: 'CANCELLED' },
        });
        await this.prisma.working.waBroadcastRecipient.updateMany({
            where: { broadcastId, status: 'PENDING' },
            data: { status: 'FAILED', failureReason: 'Broadcast cancelled' },
        });
    }
    buildComponents(variables) {
        const components = [];
        if (variables.body) {
            components.push({
                type: 'body',
                parameters: variables.body.map((v) => ({ type: 'text', text: v })),
            });
        }
        if (variables.header) {
            components.push({ type: 'header', parameters: variables.header });
        }
        return components;
    }
    async getOrCreateConversationId(wabaId, phoneNumber, contactName) {
        let conversation = await this.prisma.working.waConversation.findFirst({
            where: { wabaId, contactPhone: phoneNumber },
        });
        if (!conversation) {
            conversation = await this.prisma.working.waConversation.create({
                data: { wabaId, contactPhone: phoneNumber, contactName, status: 'OPEN' },
            });
        }
        return conversation.id;
    }
};
exports.WaBroadcastExecutorService = WaBroadcastExecutorService;
exports.WaBroadcastExecutorService = WaBroadcastExecutorService = WaBroadcastExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wa_api_service_1.WaApiService])
], WaBroadcastExecutorService);
//# sourceMappingURL=wa-broadcast-executor.service.js.map