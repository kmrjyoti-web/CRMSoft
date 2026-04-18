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
exports.VendorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../core/permissions/decorators/require-permissions.decorator");
const vendor_service_1 = require("../services/vendor.service");
const marketplace_module_service_1 = require("../services/marketplace-module.service");
const marketplace_dto_1 = require("./dto/marketplace.dto");
let VendorController = class VendorController {
    constructor(vendorService, moduleService) {
        this.vendorService = vendorService;
        this.moduleService = moduleService;
    }
    async register(dto) {
        const vendor = await this.vendorService.register(dto);
        return api_response_1.ApiResponse.success(vendor, 'Vendor registration submitted');
    }
    async listVendors(query) {
        const result = await this.vendorService.listAll(query);
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getVendor(id) {
        const vendor = await this.vendorService.getById(id);
        return api_response_1.ApiResponse.success(vendor);
    }
    async approveVendor(id) {
        const vendor = await this.vendorService.approve(id);
        return api_response_1.ApiResponse.success(vendor, 'Vendor approved');
    }
    async suspendVendor(id) {
        const vendor = await this.vendorService.suspend(id);
        return api_response_1.ApiResponse.success(vendor, 'Vendor suspended');
    }
    async createModule(vendorId, dto) {
        const mod = await this.moduleService.create(vendorId, dto);
        return api_response_1.ApiResponse.success(mod, 'Module draft created');
    }
    async updateModule(id, dto) {
        const mod = await this.moduleService.update(id, dto);
        return api_response_1.ApiResponse.success(mod, 'Module updated');
    }
    async submitForReview(id) {
        const mod = await this.moduleService.submitForReview(id);
        return api_response_1.ApiResponse.success(mod, 'Module submitted for review');
    }
    async publishModule(id) {
        const mod = await this.moduleService.publish(id);
        return api_response_1.ApiResponse.success(mod, 'Module published');
    }
};
exports.VendorController = VendorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new vendor' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marketplace_dto_1.RegisterVendorDto]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all vendors (admin)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('marketplace:admin'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marketplace_dto_1.ListVendorsQueryDto]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "listVendors", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vendor details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "getVendor", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a vendor (admin)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('marketplace:admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "approveVendor", null);
__decorate([
    (0, common_1.Put)(':id/suspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend a vendor (admin)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('marketplace:admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "suspendVendor", null);
__decorate([
    (0, common_1.Post)(':vendorId/modules'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a module draft (vendor)' }),
    __param(0, (0, common_1.Param)('vendorId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, marketplace_dto_1.CreateModuleDto]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "createModule", null);
__decorate([
    (0, common_1.Put)('modules/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a module (vendor)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, marketplace_dto_1.UpdateModuleDto]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "updateModule", null);
__decorate([
    (0, common_1.Put)('modules/:id/submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit module for review (vendor)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "submitForReview", null);
__decorate([
    (0, common_1.Put)('modules/:id/publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a module (admin)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('marketplace:admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorController.prototype, "publishModule", null);
exports.VendorController = VendorController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace Vendors'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace/vendors'),
    __metadata("design:paramtypes", [vendor_service_1.VendorService,
        marketplace_module_service_1.MarketplaceModuleService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map