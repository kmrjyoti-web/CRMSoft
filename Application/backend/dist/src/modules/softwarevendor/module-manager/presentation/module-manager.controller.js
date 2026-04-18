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
exports.ModuleManagerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const module_manager_service_1 = require("../services/module-manager.service");
const module_manager_dto_1 = require("./dto/module-manager.dto");
let ModuleManagerController = class ModuleManagerController {
    constructor(service) {
        this.service = service;
    }
    async listModules(tenantId) {
        const modules = await this.service.listTenantModules(tenantId);
        return api_response_1.ApiResponse.success(modules);
    }
    async getStatus(code, tenantId) {
        const status = await this.service.getModuleStatus(tenantId, code);
        return api_response_1.ApiResponse.success(status);
    }
    async enableModule(code, tenantId, userId) {
        const result = await this.service.enableModule(tenantId, code, userId);
        return api_response_1.ApiResponse.success(result, 'Module enabled successfully');
    }
    async disableModule(code, tenantId) {
        const result = await this.service.disableModule(tenantId, code);
        return api_response_1.ApiResponse.success(result, 'Module disabled successfully');
    }
    async updateCredentials(code, dto, tenantId) {
        const result = await this.service.updateCredentials(tenantId, code, dto.credentials);
        return api_response_1.ApiResponse.success(result, 'Credentials updated');
    }
    async validateCredentials(code, tenantId) {
        const result = await this.service.validateCredentials(tenantId, code);
        return api_response_1.ApiResponse.success(result, 'Credentials validated');
    }
};
exports.ModuleManagerController = ModuleManagerController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all modules with tenant status' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModuleManagerController.prototype, "listModules", null);
__decorate([
    (0, common_1.Get)(':code/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single module status for current tenant' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModuleManagerController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)(':code/enable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Enable a module (with auto-dependency resolution)' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ModuleManagerController.prototype, "enableModule", null);
__decorate([
    (0, common_1.Post)(':code/disable'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Disable a module (blocked if other modules depend on it)' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModuleManagerController.prototype, "disableModule", null);
__decorate([
    (0, common_1.Put)(':code/credentials'),
    (0, swagger_1.ApiOperation)({ summary: 'Update module credentials' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, module_manager_dto_1.UpdateCredentialsDto, String]),
    __metadata("design:returntype", Promise)
], ModuleManagerController.prototype, "updateCredentials", null);
__decorate([
    (0, common_1.Post)(':code/validate-credentials'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate module credentials' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModuleManagerController.prototype, "validateCredentials", null);
exports.ModuleManagerController = ModuleManagerController = __decorate([
    (0, swagger_1.ApiTags)('Module Manager'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('modules'),
    __metadata("design:paramtypes", [module_manager_service_1.ModuleManagerService])
], ModuleManagerController);
//# sourceMappingURL=module-manager.controller.js.map