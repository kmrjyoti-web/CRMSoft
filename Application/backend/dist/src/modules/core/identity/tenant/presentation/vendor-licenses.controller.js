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
exports.VendorLicensesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const license_service_1 = require("../services/license.service");
const api_response_1 = require("../../../../../common/utils/api-response");
let VendorLicensesController = class VendorLicensesController {
    constructor(licenseService) {
        this.licenseService = licenseService;
    }
    async list(status, search, page, limit) {
        const result = await this.licenseService.listAll({
            page: Number(page) || 1,
            limit: Number(limit) || 20,
            status,
            search,
        });
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        const license = await this.licenseService.getById(id);
        return api_response_1.ApiResponse.success(license);
    }
};
exports.VendorLicensesController = VendorLicensesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all license keys with pagination' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], VendorLicensesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get license by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorLicensesController.prototype, "getById", null);
exports.VendorLicensesController = VendorLicensesController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Licenses'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/licenses'),
    __metadata("design:paramtypes", [license_service_1.LicenseService])
], VendorLicensesController);
//# sourceMappingURL=vendor-licenses.controller.js.map