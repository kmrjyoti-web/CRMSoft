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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaConversationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WaConversationService = class WaConversationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreate(wabaId, contactPhone, contactName, contactPushName) {
        let conversation = await this.prisma.working.waConversation.findFirst({
            where: { wabaId, contactPhone },
        });
        if (!conversation) {
            conversation = await this.prisma.working.waConversation.create({
                data: {
                    wabaId,
                    contactPhone,
                    contactName,
                    contactPushName,
                    status: 'OPEN',
                },
            });
            await this.prisma.working.whatsAppBusinessAccount.update({
                where: { id: wabaId },
                data: { totalConversations: { increment: 1 } },
            });
        }
        else if (contactPushName && !conversation.contactPushName) {
            conversation = await this.prisma.working.waConversation.update({
                where: { id: conversation.id },
                data: { contactPushName },
            });
        }
        return conversation;
    }
    async assign(conversationId, assignToUserId) {
        return this.prisma.working.waConversation.update({
            where: { id: conversationId },
            data: { assignedToId: assignToUserId },
        });
    }
    async resolve(conversationId) {
        return this.prisma.working.waConversation.update({
            where: { id: conversationId },
            data: { status: 'RESOLVED' },
        });
    }
    async reopen(conversationId) {
        return this.prisma.working.waConversation.update({
            where: { id: conversationId },
            data: { status: 'OPEN' },
        });
    }
    async updateLastMessage(conversationId, snippet, direction) {
        const updateData = {
            lastMessageAt: new Date(),
            lastMessageSnippet: snippet,
            lastMessageDirection: direction,
            messageCount: { increment: 1 },
        };
        if (direction === 'INBOUND') {
            updateData.unreadCount = { increment: 1 };
        }
        return this.prisma.working.waConversation.update({
            where: { id: conversationId },
            data: updateData,
        });
    }
    async markRead(conversationId) {
        return this.prisma.working.waConversation.update({
            where: { id: conversationId },
            data: { unreadCount: 0 },
        });
    }
};
exports.WaConversationService = WaConversationService;
exports.WaConversationService = WaConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaConversationService);
//# sourceMappingURL=wa-conversation.service.js.map