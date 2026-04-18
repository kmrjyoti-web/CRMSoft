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
exports.PackageBuilderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const package_builder_service_1 = require("../services/package-builder.service");
const api_response_1 = require("../../../../../common/utils/api-response");
let PackageBuilderController = class PackageBuilderController {
    constructor(svc) {
        this.svc = svc;
    }
    async list(search, isActive, page, limit) {
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const active = isActive !== undefined ? isActive === 'true' : undefined;
        const result = await this.svc.list({ search, isActive: active, page: p, limit: l });
        return api_response_1.ApiResponse.paginated(result.data, result.total, p, l);
    }
    async compare(ids) {
        const packageIds = ids.split(',').map((id) => id.trim()).filter(Boolean);
        const data = await this.svc.getPackageComparison(packageIds);
        return api_response_1.ApiResponse.success(data);
    }
    async getById(id) {
        const data = await this.svc.getById(id);
        return api_response_1.ApiResponse.success(data);
    }
    async create(body) {
        const data = await this.svc.create(body);
        return api_response_1.ApiResponse.success(data, 'Package created');
    }
    async update(id, body) {
        const data = await this.svc.update(id, body);
        return api_response_1.ApiResponse.success(data, 'Package updated');
    }
    async archive(id) {
        const data = await this.svc.archive(id);
        return api_response_1.ApiResponse.success(data, 'Package archived');
    }
    async addModule(id, body) {
        const data = await this.svc.addModule(id, body);
        return api_response_1.ApiResponse.success(data, 'Module added to package');
    }
    async updateModule(id, moduleId, body) {
        const data = await this.svc.updateModule(id, moduleId, body);
        return api_response_1.ApiResponse.success(data, 'Module configuration updated');
    }
    async removeModule(id, moduleId) {
        const data = await this.svc.removeModule(id, moduleId);
        return api_response_1.ApiResponse.success(data, 'Module removed from package');
    }
    async updateLimits(id, body) {
        const data = await this.svc.updateLimits(id, body);
        return api_response_1.ApiResponse.success(data, 'Package limits updated');
    }
    async getSubscribers(id, page, limit) {
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const result = await this.svc.getSubscribers(id, { page: p, limit: l });
        return api_response_1.ApiResponse.paginated(result.data, result.total, p, l);
    }
};
exports.PackageBuilderController = PackageBuilderController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List packages with optional filters' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('isActive')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('compare'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare multiple packages side by side' }),
    __param(0, (0, common_1.Query)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "compare", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get package by ID with full module details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new package' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete (archive) a package' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/modules'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a module to a package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "addModule", null);
__decorate([
    (0, common_1.Patch)(':id/modules/:moduleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update module configuration within a package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('moduleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "updateModule", null);
__decorate([
    (0, common_1.Delete)(':id/modules/:moduleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a module from a package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "removeModule", null);
__decorate([
    (0, common_1.Patch)(':id/limits'),
    (0, swagger_1.ApiOperation)({ summary: 'Update entity limits for a package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "updateLimits", null);
__decorate([
    (0, common_1.Get)(':id/subscribers'),
    (0, swagger_1.ApiOperation)({ summary: 'List tenants subscribed to a package' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PackageBuilderController.prototype, "getSubscribers", null);
exports.PackageBuilderController = PackageBuilderController = __decorate([
    (0, swagger_1.ApiTags)('Package Builder'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/package-builder'),
    __metadata("design:paramtypes", [package_builder_service_1.PackageBuilderService])
], PackageBuilderController);
//# sourceMappingURL=package-builder.controller.js.map