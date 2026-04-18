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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const pagination_dto_1 = require("../../../../common/dto/pagination.dto");
const setup_waba_command_1 = require("../application/commands/setup-waba/setup-waba.command");
const update_waba_command_1 = require("../application/commands/update-waba/update-waba.command");
const send_text_message_command_1 = require("../application/commands/send-text-message/send-text-message.command");
const send_template_message_command_1 = require("../application/commands/send-template-message/send-template-message.command");
const send_media_message_command_1 = require("../application/commands/send-media-message/send-media-message.command");
const send_interactive_message_command_1 = require("../application/commands/send-interactive-message/send-interactive-message.command");
const send_location_message_command_1 = require("../application/commands/send-location-message/send-location-message.command");
const mark_conversation_read_command_1 = require("../application/commands/mark-conversation-read/mark-conversation-read.command");
const assign_conversation_command_1 = require("../application/commands/assign-conversation/assign-conversation.command");
const resolve_conversation_command_1 = require("../application/commands/resolve-conversation/resolve-conversation.command");
const reopen_conversation_command_1 = require("../application/commands/reopen-conversation/reopen-conversation.command");
const link_conversation_to_entity_command_1 = require("../application/commands/link-conversation-to-entity/link-conversation-to-entity.command");
const opt_out_contact_command_1 = require("../application/commands/opt-out-contact/opt-out-contact.command");
const opt_in_contact_command_1 = require("../application/commands/opt-in-contact/opt-in-contact.command");
const query_1 = require("../application/queries/get-waba-detail/query");
const query_2 = require("../application/queries/get-conversations/query");
const query_3 = require("../application/queries/get-conversation-detail/query");
const query_4 = require("../application/queries/get-conversation-messages/query");
const query_5 = require("../application/queries/get-entity-conversations/query");
const query_6 = require("../application/queries/search-conversations/query");
const query_7 = require("../application/queries/get-analytics/query");
const query_8 = require("../application/queries/get-agent-performance/query");
const query_9 = require("../application/queries/get-opt-outs/query");
const waba_dto_1 = require("./dto/waba.dto");
const message_dto_1 = require("./dto/message.dto");
const conversation_dto_1 = require("./dto/conversation.dto");
let WhatsAppController = class WhatsAppController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async setupWaba(dto) {
        const result = await this.commandBus.execute(new setup_waba_command_1.SetupWabaCommand(dto.wabaId, dto.phoneNumberId, dto.phoneNumber, dto.displayName, dto.accessToken, dto.webhookVerifyToken));
        return api_response_1.ApiResponse.success(result, 'WABA setup successfully');
    }
    async updateWaba(id, dto) {
        const result = await this.commandBus.execute(new update_waba_command_1.UpdateWabaCommand(id, dto.displayName, dto.accessToken, dto.settings));
        return api_response_1.ApiResponse.success(result, 'WABA updated successfully');
    }
    async getWabaDetail(id) {
        const result = await this.queryBus.execute(new query_1.GetWabaDetailQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async getConversations(dto) {
        const result = await this.queryBus.execute(new query_2.GetConversationsQuery(dto.wabaId, dto.page || 1, dto.limit || 20, dto.status, dto.assignedToId, dto.search));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async searchConversations(wabaId, q, pagination) {
        const result = await this.queryBus.execute(new query_6.SearchConversationsQuery(wabaId, q, pagination.page || 1, pagination.limit || 20));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getEntityConversations(type, entityId, pagination) {
        const result = await this.queryBus.execute(new query_5.GetEntityConversationsQuery(type, entityId, pagination.page || 1, pagination.limit || 20));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getConversationDetail(id) {
        const result = await this.queryBus.execute(new query_3.GetConversationDetailQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async getConversationMessages(id, pagination) {
        const result = await this.queryBus.execute(new query_4.GetConversationMessagesQuery(id, pagination.page || 1, pagination.limit || 20));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async sendText(id, dto, userId) {
        const result = await this.commandBus.execute(new send_text_message_command_1.SendTextMessageCommand(dto.wabaId, id, dto.text, userId));
        return api_response_1.ApiResponse.success(result, 'Text message sent');
    }
    async sendTemplate(id, dto, userId) {
        const result = await this.commandBus.execute(new send_template_message_command_1.SendTemplateMessageCommand(dto.wabaId, id, dto.templateId, dto.variables, userId));
        return api_response_1.ApiResponse.success(result, 'Template message sent');
    }
    async sendMedia(id, dto, userId) {
        const result = await this.commandBus.execute(new send_media_message_command_1.SendMediaMessageCommand(dto.wabaId, id, dto.type, dto.mediaUrl, dto.caption, userId));
        return api_response_1.ApiResponse.success(result, 'Media message sent');
    }
    async sendInteractive(id, dto, userId) {
        const result = await this.commandBus.execute(new send_interactive_message_command_1.SendInteractiveMessageCommand(dto.wabaId, id, dto.interactiveType, dto.interactiveData, userId));
        return api_response_1.ApiResponse.success(result, 'Interactive message sent');
    }
    async sendLocation(id, dto, userId) {
        const result = await this.commandBus.execute(new send_location_message_command_1.SendLocationMessageCommand(dto.wabaId, id, dto.lat, dto.lng, dto.name, dto.address, userId));
        return api_response_1.ApiResponse.success(result, 'Location message sent');
    }
    async markRead(id, userId) {
        await this.commandBus.execute(new mark_conversation_read_command_1.MarkConversationReadCommand(id, userId));
        return api_response_1.ApiResponse.success(null, 'Conversation marked as read');
    }
    async assign(id, dto, userId) {
        const result = await this.commandBus.execute(new assign_conversation_command_1.AssignConversationCommand(id, dto.assignToUserId, userId));
        return api_response_1.ApiResponse.success(result, 'Conversation assigned');
    }
    async resolve(id, userId) {
        const result = await this.commandBus.execute(new resolve_conversation_command_1.ResolveConversationCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Conversation resolved');
    }
    async reopen(id) {
        const result = await this.commandBus.execute(new reopen_conversation_command_1.ReopenConversationCommand(id));
        return api_response_1.ApiResponse.success(result, 'Conversation reopened');
    }
    async linkEntity(id, dto, userId) {
        await this.commandBus.execute(new link_conversation_to_entity_command_1.LinkConversationToEntityCommand(id, dto.entityType, dto.entityId, userId));
        return api_response_1.ApiResponse.success(null, 'Conversation linked to entity');
    }
    async getAnalytics(wabaId, dateFrom, dateTo) {
        const result = await this.queryBus.execute(new query_7.GetAnalyticsQuery(wabaId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async getAgentPerformance(wabaId, dateFrom, dateTo) {
        const result = await this.queryBus.execute(new query_8.GetAgentPerformanceQuery(wabaId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
    async getOptOuts(wabaId, pagination) {
        const result = await this.queryBus.execute(new query_9.GetOptOutsQuery(wabaId, pagination.page || 1, pagination.limit || 20));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async optOut(body) {
        await this.commandBus.execute(new opt_out_contact_command_1.OptOutContactCommand(body.wabaId, body.phoneNumber, body.contactId, body.reason));
        return api_response_1.ApiResponse.success(null, 'Contact opted out');
    }
    async optIn(body) {
        await this.commandBus.execute(new opt_in_contact_command_1.OptInContactCommand(body.wabaId, body.phoneNumber));
        return api_response_1.ApiResponse.success(null, 'Contact opted in');
    }
};
exports.WhatsAppController = WhatsAppController;
__decorate([
    (0, common_1.Post)('waba/setup'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [waba_dto_1.SetupWabaDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "setupWaba", null);
__decorate([
    (0, common_1.Put)('waba/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, waba_dto_1.UpdateWabaDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "updateWaba", null);
__decorate([
    (0, common_1.Get)('waba/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getWabaDetail", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [conversation_dto_1.ConversationQueryDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/search'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)('wabaId')),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "searchConversations", null);
__decorate([
    (0, common_1.Get)('conversations/entity/:type/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getEntityConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getConversationDetail", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getConversationMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:id/send-text'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, message_dto_1.SendTextMessageDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendText", null);
__decorate([
    (0, common_1.Post)('conversations/:id/send-template'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, message_dto_1.SendTemplateMessageDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendTemplate", null);
__decorate([
    (0, common_1.Post)('conversations/:id/send-media'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, message_dto_1.SendMediaMessageDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendMedia", null);
__decorate([
    (0, common_1.Post)('conversations/:id/send-interactive'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, message_dto_1.SendInteractiveMessageDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendInteractive", null);
__decorate([
    (0, common_1.Post)('conversations/:id/send-location'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, message_dto_1.SendLocationMessageDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "sendLocation", null);
__decorate([
    (0, common_1.Post)('conversations/:id/read'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:send'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('conversations/:id/assign'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, conversation_dto_1.AssignConversationDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('conversations/:id/resolve'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('conversations/:id/reopen'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "reopen", null);
__decorate([
    (0, common_1.Post)('conversations/:id/link'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, conversation_dto_1.LinkConversationDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "linkEntity", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)('wabaId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/agents'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)('wabaId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getAgentPerformance", null);
__decorate([
    (0, common_1.Get)('opt-outs'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)('wabaId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "getOptOuts", null);
__decorate([
    (0, common_1.Post)('opt-out'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "optOut", null);
__decorate([
    (0, common_1.Post)('opt-in'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppController.prototype, "optIn", null);
exports.WhatsAppController = WhatsAppController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WhatsAppController);
//# sourceMappingURL=whatsapp.controller.js.map