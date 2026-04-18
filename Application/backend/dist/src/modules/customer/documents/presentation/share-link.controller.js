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
exports.ShareLinkController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_share_link_command_1 = require("../application/commands/create-share-link/create-share-link.command");
const revoke_share_link_command_1 = require("../application/commands/revoke-share-link/revoke-share-link.command");
const get_share_link_query_1 = require("../application/queries/get-share-link/get-share-link.query");
const share_link_dto_1 = require("./dto/share-link.dto");
const share_link_service_1 = require("../services/share-link.service");
let ShareLinkController = class ShareLinkController {
    constructor(commandBus, queryBus, shareLinkService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.shareLinkService = shareLinkService;
    }
    async create(documentId, dto, userId) {
        const result = await this.commandBus.execute(new create_share_link_command_1.CreateShareLinkCommand(documentId, userId, dto.access, dto.password, dto.expiresAt ? new Date(dto.expiresAt) : undefined, dto.maxViews));
        return api_response_1.ApiResponse.success(result, 'Share link created successfully');
    }
    async accessLink(token, password) {
        const result = await this.queryBus.execute(new get_share_link_query_1.GetShareLinkQuery(token, password));
        return api_response_1.ApiResponse.success(result);
    }
    async getDocumentLinks(documentId) {
        const result = await this.shareLinkService.getDocumentLinks(documentId);
        return api_response_1.ApiResponse.success(result);
    }
    async revokeLink(linkId, userId) {
        await this.commandBus.execute(new revoke_share_link_command_1.RevokeShareLinkCommand(linkId, userId));
        return api_response_1.ApiResponse.success(null, 'Share link revoked successfully');
    }
};
exports.ShareLinkController = ShareLinkController;
__decorate([
    (0, common_1.Post)(':documentId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:create'),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, share_link_dto_1.CreateShareLinkDto, String]),
    __metadata("design:returntype", Promise)
], ShareLinkController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('access/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Query)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShareLinkController.prototype, "accessLink", null);
__decorate([
    (0, common_1.Get)(':documentId/links'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShareLinkController.prototype, "getDocumentLinks", null);
__decorate([
    (0, common_1.Delete)(':linkId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:delete'),
    __param(0, (0, common_1.Param)('linkId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShareLinkController.prototype, "revokeLink", null);
exports.ShareLinkController = ShareLinkController = __decorate([
    (0, swagger_1.ApiTags)('Document Share Links'),
    (0, common_1.Controller)('document-shares'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        share_link_service_1.ShareLinkService])
], ShareLinkController);
//# sourceMappingURL=share-link.controller.js.map