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
exports.WhatsAppQuickRepliesController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_quick_reply_command_1 = require("../application/commands/create-quick-reply/create-quick-reply.command");
const query_1 = require("../application/queries/get-quick-replies/query");
const quick_reply_dto_1 = require("./dto/quick-reply.dto");
let WhatsAppQuickRepliesController = class WhatsAppQuickRepliesController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_quick_reply_command_1.CreateQuickReplyCommand(dto.wabaId, dto.shortcut, dto.message, userId, dto.category));
        return api_response_1.ApiResponse.success(result, 'Quick reply created');
    }
    async list(wabaId, category) {
        const result = await this.queryBus.execute(new query_1.GetQuickRepliesQuery(wabaId, category));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.WhatsAppQuickRepliesController = WhatsAppQuickRepliesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quick_reply_dto_1.CreateQuickReplyDto, String]),
    __metadata("design:returntype", Promise)
], WhatsAppQuickRepliesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)('wabaId')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppQuickRepliesController.prototype, "list", null);
exports.WhatsAppQuickRepliesController = WhatsAppQuickRepliesController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp Quick Replies'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('whatsapp/quick-replies'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WhatsAppQuickRepliesController);
//# sourceMappingURL=whatsapp-quick-replies.controller.js.map