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
var MarkConversationReadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkConversationReadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const mark_conversation_read_command_1 = require("./mark-conversation-read.command");
const wa_conversation_service_1 = require("../../../services/wa-conversation.service");
const wa_api_service_1 = require("../../../services/wa-api.service");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let MarkConversationReadHandler = MarkConversationReadHandler_1 = class MarkConversationReadHandler {
    constructor(prisma, conversationService, waApiService) {
        this.prisma = prisma;
        this.conversationService = conversationService;
        this.waApiService = waApiService;
        this.logger = new common_1.Logger(MarkConversationReadHandler_1.name);
    }
    async execute(cmd) {
        try {
            const conversation = await this.prisma.working.waConversation.findUniqueOrThrow({
                where: { id: cmd.conversationId },
            });
            const lastInboundMessage = await this.prisma.working.waMessage.findFirst({
                where: {
                    conversationId: cmd.conversationId,
                    direction: 'INBOUND',
                },
                orderBy: { createdAt: 'desc' },
            });
            if (lastInboundMessage?.waMessageId) {
                await this.waApiService.markAsRead(conversation.wabaId, lastInboundMessage.waMessageId);
            }
            await this.conversationService.markRead(cmd.conversationId);
            this.logger.log(`Conversation ${cmd.conversationId} marked as read by user ${cmd.userId}`);
        }
        catch (error) {
            this.logger.error(`MarkConversationReadHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MarkConversationReadHandler = MarkConversationReadHandler;
exports.MarkConversationReadHandler = MarkConversationReadHandler = MarkConversationReadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(mark_conversation_read_command_1.MarkConversationReadCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wa_conversation_service_1.WaConversationService,
        wa_api_service_1.WaApiService])
], MarkConversationReadHandler);
//# sourceMappingURL=mark-conversation-read.handler.js.map