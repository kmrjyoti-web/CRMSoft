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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const identity_client_1 = require("@prisma/identity-client");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const tenant_config_service_1 = require("../services/tenant-config.service");
const update_config_dto_1 = require("./dto/update-config.dto");
const bulk_update_config_dto_1 = require("./dto/bulk-update-config.dto");
let ConfigController = class ConfigController {
    constructor(configService) {
        this.configService = configService;
    }
    async getAll(tenantId) {
        const configs = await this.configService.getAll(tenantId);
        return api_response_1.ApiResponse.success(configs, 'Configs retrieved');
    }
    async getByCategory(tenantId, category) {
        const configs = await this.configService.getByCategory(tenantId, category);
        return api_response_1.ApiResponse.success(configs, 'Category configs retrieved');
    }
    async bulkSet(tenantId, userId, userName, dto) {
        const result = await this.configService.bulkSet(tenantId, dto.configs, userId, userName);
        return api_response_1.ApiResponse.success(result, `${result.updated} configs updated`);
    }
    async get(tenantId, key) {
        const value = await this.configService.get(tenantId, key);
        return api_response_1.ApiResponse.success({ key, value }, 'Config retrieved');
    }
    async set(tenantId, userId, userName, key, dto) {
        await this.configService.set(tenantId, key, dto.value, userId, userName);
        return api_response_1.ApiResponse.success(null, `Config '${key}' updated`);
    }
    async resetToDefault(tenantId, userId, key) {
        await this.configService.resetToDefault(tenantId, key, userId);
        return api_response_1.ApiResponse.success(null, `Config '${key}' reset to default`);
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getByCategory", null);
__decorate([
    (0, common_1.Put)('bulk'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('name')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, bulk_update_config_dto_1.BulkUpdateConfigDto]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "bulkSet", null);
__decorate([
    (0, common_1.Get)(':key'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':key'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('name')),
    __param(3, (0, common_1.Param)('key')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, update_config_dto_1.UpdateConfigDto]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "set", null);
__decorate([
    (0, common_1.Post)('reset/:key'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "resetToDefault", null);
exports.ConfigController = ConfigController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('config'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [tenant_config_service_1.TenantConfigService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map