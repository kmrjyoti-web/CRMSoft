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
exports.VendorDbAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
const vendor_tenants_service_1 = require("../services/vendor-tenants.service");
let VendorDbAdminController = class VendorDbAdminController {
    constructor(vendorTenantsService) {
        this.vendorTenantsService = vendorTenantsService;
    }
    async listDatabases(page = 1, limit = 20) {
        const p = +page;
        const l = +limit;
        const { tenants, total } = await this.vendorTenantsService.listForDbAdmin(p, l);
        return api_response_1.ApiResponse.paginated(tenants, total, p, l);
    }
    async migrate(tenantId) {
        return api_response_1.ApiResponse.success({ tenantId, status: 'completed', message: 'Migration complete' });
    }
    async repair(tenantId) {
        return api_response_1.ApiResponse.success({ tenantId, status: 'completed', message: 'Repair complete' });
    }
    async backup(tenantId) {
        return api_response_1.ApiResponse.success({ tenantId, url: '', message: 'Backup initiated' });
    }
};
exports.VendorDbAdminController = VendorDbAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List tenants as databases' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorDbAdminController.prototype, "listDatabases", null);
__decorate([
    (0, common_1.Post)(':tenantId/migrate'),
    (0, swagger_1.ApiOperation)({ summary: 'Run migration for a tenant (stub)' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDbAdminController.prototype, "migrate", null);
__decorate([
    (0, common_1.Post)(':tenantId/repair'),
    (0, swagger_1.ApiOperation)({ summary: 'Repair tenant database (stub)' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDbAdminController.prototype, "repair", null);
__decorate([
    (0, common_1.Post)(':tenantId/backup'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate tenant database backup (stub)' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorDbAdminController.prototype, "backup", null);
exports.VendorDbAdminController = VendorDbAdminController = __decorate([
    (0, swagger_1.ApiTags)('DB Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('admin/db'),
    __metadata("design:paramtypes", [vendor_tenants_service_1.VendorTenantsService])
], VendorDbAdminController);
//# sourceMappingURL=vendor-db-admin.controller.js.map