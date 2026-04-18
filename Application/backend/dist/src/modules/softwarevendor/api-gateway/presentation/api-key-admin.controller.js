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
exports.ApiKeyAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const api_key_service_1 = require("../services/api-key.service");
const api_key_dto_1 = require("./dto/api-key.dto");
let ApiKeyAdminController = class ApiKeyAdminController {
    constructor(apiKeyService) {
        this.apiKeyService = apiKeyService;
    }
    async create(req, dto) {
        return this.apiKeyService.create(req.user.tenantId, dto, req.user.id, `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim());
    }
    async list(req) {
        return this.apiKeyService.listByTenant(req.user.tenantId);
    }
    getAvailableScopes() {
        return this.apiKeyService.getAvailableScopes();
    }
    async getById(req, id) {
        return this.apiKeyService.getById(req.user.tenantId, id);
    }
    async updateScopes(req, id, dto) {
        return this.apiKeyService.updateScopes(req.user.tenantId, id, dto.scopes);
    }
    async revoke(req, id, dto) {
        await this.apiKeyService.revoke(req.user.tenantId, id, dto.reason, req.user.id);
        return { message: 'API key revoked' };
    }
    async regenerate(req, id) {
        return this.apiKeyService.regenerate(req.user.tenantId, id, req.user.id, `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim());
    }
};
exports.ApiKeyAdminController = ApiKeyAdminController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, api_key_dto_1.CreateApiKeyDto]),
    __metadata("design:returntype", Promise)
], ApiKeyAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiKeyAdminController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('scopes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiKeyAdminController.prototype, "getAvailableScopes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApiKeyAdminController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id/scopes'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, api_key_dto_1.UpdateApiKeyScopesDto]),
    __metadata("design:returntype", Promise)
], ApiKeyAdminController.prototype, "updateScopes", null);
__decorate([
    (0, common_1.Post)(':id/revoke'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, api_key_dto_1.RevokeApiKeyDto]),
    __metadata("design:returntype", Promise)
], ApiKeyAdminController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)(':id/regenerate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApiKeyAdminController.prototype, "regenerate", null);
exports.ApiKeyAdminController = ApiKeyAdminController = __decorate([
    (0, common_1.Controller)('api-gateway/admin/api-keys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [api_key_service_1.ApiKeyService])
], ApiKeyAdminController);
//# sourceMappingURL=api-key-admin.controller.js.map