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
exports.CloudController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const connect_cloud_command_1 = require("../application/commands/connect-cloud/connect-cloud.command");
const disconnect_cloud_command_1 = require("../application/commands/disconnect-cloud/disconnect-cloud.command");
const get_cloud_connections_query_1 = require("../application/queries/get-cloud-connections/get-cloud-connections.query");
const cloud_dto_1 = require("./dto/cloud.dto");
const working_client_1 = require("@prisma/working-client");
let CloudController = class CloudController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async connect(dto, userId) {
        const result = await this.commandBus.execute(new connect_cloud_command_1.ConnectCloudCommand(userId, dto.provider, dto.accessToken, dto.refreshToken, dto.tokenExpiry ? new Date(dto.tokenExpiry) : undefined, dto.accountEmail, dto.accountName));
        return api_response_1.ApiResponse.success(result, 'Cloud provider connected successfully');
    }
    async list(userId) {
        const result = await this.queryBus.execute(new get_cloud_connections_query_1.GetCloudConnectionsQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async disconnect(provider, userId) {
        await this.commandBus.execute(new disconnect_cloud_command_1.DisconnectCloudCommand(userId, provider));
        return api_response_1.ApiResponse.success(null, 'Cloud provider disconnected successfully');
    }
};
exports.CloudController = CloudController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cloud_dto_1.ConnectCloudDto, String]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)(':provider'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:delete'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "disconnect", null);
exports.CloudController = CloudController = __decorate([
    (0, swagger_1.ApiTags)('Cloud Connections'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cloud-connections'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], CloudController);
//# sourceMappingURL=cloud.controller.js.map