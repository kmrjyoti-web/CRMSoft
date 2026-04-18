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
exports.LicenseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const super_admin_guard_1 = require("../infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../infrastructure/decorators/super-admin-route.decorator");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const license_service_1 = require("../services/license.service");
const tenant_activity_service_1 = require("../services/tenant-activity.service");
const generate_license_dto_1 = require("./dto/generate-license.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let LicenseController = class LicenseController {
    constructor(licenseService, tenantActivityService) {
        this.licenseService = licenseService;
        this.tenantActivityService = tenantActivityService;
    }
    async listAll(query) {
        const result = await this.licenseService.listAll(query);
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async generate(body, user) {
        const license = await this.licenseService.generate({
            tenantId: body.tenantId,
            planId: body.planId,
            maxUsers: body.maxUsers,
            expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
            allowedModules: body.allowedModules,
            notes: body.notes,
        });
        await this.tenantActivityService.log({
            tenantId: body.tenantId,
            action: 'LICENSE_GENERATED',
            category: 'LICENSE',
            details: `License key generated: ${license.licenseKey}`,
            performedById: user?.id,
        });
        return api_response_1.ApiResponse.success(license, 'License generated');
    }
    async getById(id) {
        const license = await this.licenseService.getById(id);
        return api_response_1.ApiResponse.success(license);
    }
    async activate(id, user) {
        const license = await this.licenseService.activate(id);
        await this.tenantActivityService.log({
            tenantId: license.tenantId,
            action: 'LICENSE_ACTIVATED',
            category: 'LICENSE',
            details: `License key activated: ${license.licenseKey}`,
            performedById: user?.id,
        });
        return api_response_1.ApiResponse.success(license, 'License activated');
    }
    async suspend(id, user) {
        const license = await this.licenseService.suspend(id);
        await this.tenantActivityService.log({
            tenantId: license.tenantId,
            action: 'LICENSE_SUSPENDED',
            category: 'LICENSE',
            details: `License key suspended: ${license.licenseKey}`,
            performedById: user?.id,
        });
        return api_response_1.ApiResponse.success(license, 'License suspended');
    }
    async revoke(id, user) {
        const license = await this.licenseService.revoke(id);
        await this.tenantActivityService.log({
            tenantId: license.tenantId,
            action: 'LICENSE_REVOKED',
            category: 'LICENSE',
            details: `License key revoked: ${license.licenseKey}`,
            performedById: user?.id,
        });
        return api_response_1.ApiResponse.success(license, 'License revoked');
    }
    async validate(licenseKey) {
        const result = await this.licenseService.validate(licenseKey);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.LicenseController = LicenseController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all license keys (paginated)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "listAll", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a new license key for a tenant' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_license_dto_1.GenerateLicenseDto, Object]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get license key by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a license key' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend a license key' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/revoke'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke a license key' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a license key' }),
    __param(0, (0, common_1.Body)('licenseKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "validate", null);
exports.LicenseController = LicenseController = __decorate([
    (0, swagger_1.ApiTags)('License Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/licenses'),
    __metadata("design:paramtypes", [license_service_1.LicenseService,
        tenant_activity_service_1.TenantActivityService])
], LicenseController);
//# sourceMappingURL=license.controller.js.map