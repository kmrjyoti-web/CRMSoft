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
exports.VendorModulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const vendor_modules_service_1 = require("../services/vendor-modules.service");
const api_response_1 = require("../../../../../common/utils/api-response");
let VendorModulesController = class VendorModulesController {
    constructor(vendorModulesService) {
        this.vendorModulesService = vendorModulesService;
    }
    async list(user, status, page, limit) {
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const { data, total } = await this.vendorModulesService.list({ vendorId: user.vendorId, status, page: p, limit: l });
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async getById(id) {
        return api_response_1.ApiResponse.success(await this.vendorModulesService.getById(id));
    }
    async create(user, body) {
        const module = await this.vendorModulesService.create({
            moduleCode: body.code ?? body.moduleCode ?? '',
            moduleName: body.name ?? body.moduleName ?? '',
            category: body.category,
            shortDescription: body.description ?? body.shortDescription ?? '',
            longDescription: body.longDescription ?? '',
            version: body.version ?? '1.0.0',
            vendorId: user.vendorId,
        });
        return api_response_1.ApiResponse.success(module, 'Module created');
    }
    async update(id, body) {
        const data = {};
        if (body.moduleName !== undefined)
            data['moduleName'] = body.moduleName;
        if (body.shortDescription !== undefined)
            data['shortDescription'] = body.shortDescription;
        if (body.longDescription !== undefined)
            data['longDescription'] = body.longDescription;
        if (body.version !== undefined)
            data['version'] = body.version;
        if (body.category !== undefined)
            data['category'] = body.category;
        if (body.status !== undefined)
            data['status'] = body.status;
        const module = await this.vendorModulesService.update(id, data);
        return api_response_1.ApiResponse.success(module, 'Module updated');
    }
    async remove(id) {
        const module = await this.vendorModulesService.deactivate(id);
        return api_response_1.ApiResponse.success(module, 'Module deactivated');
    }
};
exports.VendorModulesController = VendorModulesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List marketplace modules' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorModulesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get module by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorModulesController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a marketplace module' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorModulesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a marketplace module' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorModulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a marketplace module' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorModulesController.prototype, "remove", null);
exports.VendorModulesController = VendorModulesController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Modules'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/modules'),
    __metadata("design:paramtypes", [vendor_modules_service_1.VendorModulesService])
], VendorModulesController);
//# sourceMappingURL=vendor-modules.controller.js.map