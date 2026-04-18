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
exports.VendorPackagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const vendor_packages_service_1 = require("../services/vendor-packages.service");
const api_response_1 = require("../../../../../common/utils/api-response");
let VendorPackagesController = class VendorPackagesController {
    constructor(vendorPackagesService) {
        this.vendorPackagesService = vendorPackagesService;
    }
    async list(page, limit) {
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const { data, total } = await this.vendorPackagesService.list(p, l);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async getById(id) {
        return api_response_1.ApiResponse.success(await this.vendorPackagesService.getById(id));
    }
    async create(body) {
        return api_response_1.ApiResponse.success(await this.vendorPackagesService.create(body), 'Plan created');
    }
    async update(id, body) {
        return api_response_1.ApiResponse.success(await this.vendorPackagesService.update(id, body), 'Plan updated');
    }
    async remove(id) {
        return api_response_1.ApiResponse.success(await this.vendorPackagesService.deactivate(id), 'Plan deactivated');
    }
};
exports.VendorPackagesController = VendorPackagesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List subscription plans with pagination' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VendorPackagesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get plan by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorPackagesController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a subscription plan' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorPackagesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subscription plan' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorPackagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a subscription plan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorPackagesController.prototype, "remove", null);
exports.VendorPackagesController = VendorPackagesController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Packages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/packages'),
    __metadata("design:paramtypes", [vendor_packages_service_1.VendorPackagesService])
], VendorPackagesController);
//# sourceMappingURL=vendor-packages.controller.js.map