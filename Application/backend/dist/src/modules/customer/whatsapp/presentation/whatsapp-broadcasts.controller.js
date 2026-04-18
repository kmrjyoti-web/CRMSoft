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
exports.WhatsAppBroadcastsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_broadcast_command_1 = require("../application/commands/create-broadcast/create-broadcast.command");
const add_broadcast_recipients_command_1 = require("../application/commands/add-broadcast-recipients/add-broadcast-recipients.command");
const start_broadcast_command_1 = require("../application/commands/start-broadcast/start-broadcast.command");
const pause_broadcast_command_1 = require("../application/commands/pause-broadcast/pause-broadcast.command");
const cancel_broadcast_command_1 = require("../application/commands/cancel-broadcast/cancel-broadcast.command");
const query_1 = require("../application/queries/get-broadcasts/query");
const query_2 = require("../application/queries/get-broadcast-detail/query");
const query_3 = require("../application/queries/get-broadcast-recipients/query");
const broadcast_dto_1 = require("./dto/broadcast.dto");
let WhatsAppBroadcastsController = class WhatsAppBroadcastsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, user) {
        const result = await this.commandBus.execute(new create_broadcast_command_1.CreateBroadcastCommand(dto.wabaId, dto.name, dto.templateId, dto.scheduledAt ? new Date(dto.scheduledAt) : undefined, dto.throttlePerSecond, user.id, `${user.firstName} ${user.lastName}`.trim()));
        return api_response_1.ApiResponse.success(result, 'Broadcast created');
    }
    async addRecipients(id, dto) {
        const result = await this.commandBus.execute(new add_broadcast_recipients_command_1.AddBroadcastRecipientsCommand(id, dto.recipients));
        return api_response_1.ApiResponse.success(result, 'Recipients added');
    }
    async start(id, userId) {
        await this.commandBus.execute(new start_broadcast_command_1.StartBroadcastCommand(id, userId));
        return api_response_1.ApiResponse.success(null, 'Broadcast started');
    }
    async pause(id) {
        await this.commandBus.execute(new pause_broadcast_command_1.PauseBroadcastCommand(id));
        return api_response_1.ApiResponse.success(null, 'Broadcast paused');
    }
    async cancel(id) {
        await this.commandBus.execute(new cancel_broadcast_command_1.CancelBroadcastCommand(id));
        return api_response_1.ApiResponse.success(null, 'Broadcast cancelled');
    }
    async list(dto) {
        const result = await this.queryBus.execute(new query_1.GetBroadcastsQuery(dto.wabaId, dto.page || 1, dto.limit || 20, dto.status));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async detail(id) {
        const result = await this.queryBus.execute(new query_2.GetBroadcastDetailQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async recipients(id, dto) {
        const result = await this.queryBus.execute(new query_3.GetBroadcastRecipientsQuery(id, dto.page || 1, dto.limit || 20, dto.status));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
};
exports.WhatsAppBroadcastsController = WhatsAppBroadcastsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [broadcast_dto_1.CreateBroadcastDto, Object]),
    __metadata("design:returntype", Promise)
], WhatsAppBroadcastsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/recipients'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, broadcast_dto_1.AddBroadcastRecipientsDto]),
    __metadata("design:returntype", Promise)
], WhatsAppBroadcastsController.prototype, "addRecipients", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppBroadcastsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBroadcastsController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBroadcastsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [broadcast_dto_1.BroadcastQueryDto]),
    __metadata("design:returntype", Promise)
], WhatsAppBroadcastsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsAppBroadcastsController.prototype, "detail", null);
__decorate([
    (0, common_1.Get)(':id/recipients'),
    (0, require_permissions_decorator_1.RequirePermissions)('whatsapp:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, broadcast_dto_1.BroadcastRecipientQueryDto]),
    __metadata("design:returntype", Promise)
], WhatsAppBroadcastsController.prototype, "recipients", null);
exports.WhatsAppBroadcastsController = WhatsAppBroadcastsController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp Broadcasts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('whatsapp/broadcasts'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], WhatsAppBroadcastsController);
//# sourceMappingURL=whatsapp-broadcasts.controller.js.map