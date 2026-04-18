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
exports.TenantProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const super_admin_guard_1 = require("../infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../infrastructure/decorators/super-admin-route.decorator");
const tenant_profile_service_1 = require("../services/tenant-profile.service");
const tenant_activity_service_1 = require("../services/tenant-activity.service");
const upsert_tenant_profile_dto_1 = require("./dto/upsert-tenant-profile.dto");
const tenant_activity_query_dto_1 = require("./dto/tenant-activity-query.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let TenantProfileController = class TenantProfileController {
    constructor(tenantProfileService, tenantActivityService) {
        this.tenantProfileService = tenantProfileService;
        this.tenantActivityService = tenantActivityService;
    }
    async getProfile(tenantId) {
        const profile = await this.tenantProfileService.getByTenantId(tenantId);
        return api_response_1.ApiResponse.success(profile);
    }
    async upsertProfile(tenantId, body) {
        const profile = await this.tenantProfileService.upsert(tenantId, body);
        return api_response_1.ApiResponse.success(profile, 'Tenant profile updated');
    }
    async getActivity(tenantId, query) {
        const result = await this.tenantActivityService.getByTenant(tenantId, {
            category: query.category,
            page: query.page,
            limit: query.limit,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
};
exports.TenantProfileController = TenantProfileController;
__decorate([
    (0, common_1.Get)(':tenantId/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant profile by tenant ID' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)(':tenantId/profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update tenant profile' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_tenant_profile_dto_1.UpsertTenantProfileDto]),
    __metadata("design:returntype", Promise)
], TenantProfileController.prototype, "upsertProfile", null);
__decorate([
    (0, common_1.Get)(':tenantId/activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant activity logs (paginated)' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tenant_activity_query_dto_1.TenantActivityQueryDto]),
    __metadata("design:returntype", Promise)
], TenantProfileController.prototype, "getActivity", null);
exports.TenantProfileController = TenantProfileController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/tenant-profiles'),
    __metadata("design:paramtypes", [tenant_profile_service_1.TenantProfileService,
        tenant_activity_service_1.TenantActivityService])
], TenantProfileController);
//# sourceMappingURL=tenant-profile.controller.js.map