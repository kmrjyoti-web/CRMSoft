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
exports.VendorTenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const vendor_tenants_service_1 = require("../services/vendor-tenants.service");
const api_response_1 = require("../../../../../common/utils/api-response");
let VendorTenantsController = class VendorTenantsController {
    constructor(vendorTenantsService) {
        this.vendorTenantsService = vendorTenantsService;
    }
    async list(status, page, limit) {
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const { data, total } = await this.vendorTenantsService.list({ status, page: p, limit: l });
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async getById(id) {
        return api_response_1.ApiResponse.success(await this.vendorTenantsService.getById(id));
    }
    async suspend(id) {
        return api_response_1.ApiResponse.success(await this.vendorTenantsService.suspend(id), 'Tenant suspended');
    }
    async activate(id) {
        return api_response_1.ApiResponse.success(await this.vendorTenantsService.activate(id), 'Tenant activated');
    }
    async extendTrial(id, body) {
        return api_response_1.ApiResponse.success({ tenantId: id, daysExtended: body.days ?? 0 }, 'Trial extension recorded (stub)');
    }
};
exports.VendorTenantsController = VendorTenantsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List tenants with pagination' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], VendorTenantsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorTenantsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend a tenant' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorTenantsController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a tenant' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorTenantsController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/extend-trial'),
    (0, swagger_1.ApiOperation)({ summary: 'Extend tenant trial period (stub)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorTenantsController.prototype, "extendTrial", null);
exports.VendorTenantsController = VendorTenantsController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Tenants'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/tenants'),
    __metadata("design:paramtypes", [vendor_tenants_service_1.VendorTenantsService])
], VendorTenantsController);
//# sourceMappingURL=vendor-tenants.controller.js.map