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
exports.WhatsAppChatbotController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_chatbot_flow_command_1 = require("../application/commands/create-chatbot-flow/create-chatbot-flow.command");
const update_chatbot_flow_command_1 = require("../application/commands/update-chatbot-flow/update-chatbot-flow.command");
const toggle_chatbot_flow_command_1 = require("../application/commands/toggle-chatbot-flow/toggle-chatbot-flow.command");
const query_1 = require("../application/queries/get-chatbot-flows/query");
const query_2 = require("../application/queries/get-chatbot-flow-detail/query");
const chatbot_dto_1 = require("./dto/chatbot.dto");
let WhatsAppChatbotController = class WhatsAppChatbotController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_chatbot_flow_command_1.CreateChatbotFlowCommand(dto.wabaId, dto.name, dto.triggerKeywords, dto.nodes, userId));
        return api_response_1.ApiResponse.success(result, 'Chatbot flow created');
    }
    async update(id, dto) {
        const result = await this.commandBus.execute(new update_chatbot_flow_command_1.UpdateChatbotFlowCommand(id, dto.name, dto.triggerKeywords, dto.nodes));
        return api_response_1.ApiResponse.success(result, 'Chatbot flow updated');
    }
    async toggle(id, dto) {
        const result = await this.commandBus.execute(new toggle_chatbot_flow_command_1.ToggleChatbotFlowCommand(id, dto.status));
        return api_response_1.ApiResponse.success(result, 'Chatbot flow status updated');
    }
    async list(wabaId, status) {
        const result = await this.queryBus.execute(new query_1.GetChatbotFlowsQuery(wabaId, status));
        return api_response_1.ApiResponse.success(result);
    }
    async detail(id) {
        const result = await this.queryBus.execute(new query_2.GetChatbotFlowDetailQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.WhatsAppChatbotController = WhatsAppChatbotController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chatbot_dto_1.CreateChatbotFlowDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppChatbotController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, chatbot_dto_1.UpdateChatbotFlowDto]),
    __metadata("design:returntype", Promise)
], WhatsAppChatbotController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/toggle'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, chatbot_dto_1.ToggleChatbotFlowDto]),
    __metadata("design:returntype", Promise)
], WhatsAppChatbotController.prototype, "toggle", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)('wabaId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppChatbotController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppChatbotController.prototype, "detail", null);
exports.WhatsAppChatbotController = WhatsAppChatbotController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp Chatbot'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('whatsapp/chatbot'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WhatsAppChatbotController);
//# sourceMappingURL=whatsapp-chatbot.controller.js.map