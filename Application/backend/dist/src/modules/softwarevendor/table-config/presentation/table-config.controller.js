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
exports.TableConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const table_config_service_1 = require("../services/table-config.service");
const upsert_table_config_dto_1 = require("./dto/upsert-table-config.dto");
let TableConfigController = class TableConfigController {
    constructor(service) {
        this.service = service;
    }
    async getConfig(tableKey, userId, tenantId) {
        const config = await this.service.getConfig(tableKey, userId, tenantId);
        return api_response_1.ApiResponse.success(config);
    }
    async upsertConfig(tableKey, dto, userId, tenantId) {
        if (dto.applyToAll) {
            const config = await this.service.upsertTenantDefault(tableKey, tenantId, dto.config);
            return api_response_1.ApiResponse.success(config, 'Tenant-wide default saved');
        }
        const config = await this.service.upsertUserConfig(tableKey, userId, tenantId, dto.config);
        return api_response_1.ApiResponse.success(config, 'Config saved');
    }
    async upsertDefault(tableKey, dto, tenantId) {
        const config = await this.service.upsertTenantDefault(tableKey, tenantId, dto.config);
        return api_response_1.ApiResponse.success(config, 'Tenant-wide default saved');
    }
    async resetConfig(tableKey, userId, tenantId) {
        const result = await this.service.deleteUserConfig(tableKey, userId, tenantId);
        return api_response_1.ApiResponse.success(result, 'Config reset to default');
    }
};
exports.TableConfigController = TableConfigController;
__decorate([
    (0, common_1.Get)(':tableKey'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merged table config for current user' }),
    __param(0, (0, common_1.Param)('tableKey')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TableConfigController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)(':tableKey'),
    (0, swagger_1.ApiOperation)({ summary: 'Save table config for current user' }),
    __param(0, (0, common_1.Param)('tableKey')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_table_config_dto_1.UpsertTableConfigDto, String, String]),
    __metadata("design:returntype", Promise)
], TableConfigController.prototype, "upsertConfig", null);
__decorate([
    (0, common_1.Put)(':tableKey/default'),
    (0, swagger_1.ApiOperation)({ summary: 'Save tenant-wide default config (admin only)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('table-config:manage'),
    __param(0, (0, common_1.Param)('tableKey')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_table_config_dto_1.UpsertTableConfigDto, String]),
    __metadata("design:returntype", Promise)
], TableConfigController.prototype, "upsertDefault", null);
__decorate([
    (0, common_1.Delete)(':tableKey'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset table config to default for current user' }),
    __param(0, (0, common_1.Param)('tableKey')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TableConfigController.prototype, "resetConfig", null);
exports.TableConfigController = TableConfigController = __decorate([
    (0, swagger_1.ApiTags)('Table Config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('table-config'),
    __metadata("design:paramtypes", [table_config_service_1.TableConfigService])
], TableConfigController);
//# sourceMappingURL=table-config.controller.js.map