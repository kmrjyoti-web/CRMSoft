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
exports.VendorDashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const super_admin_guard_1 = require("../infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../infrastructure/decorators/super-admin-route.decorator");
const vendor_dashboard_service_1 = require("../services/vendor-dashboard.service");
const vendor_dashboard_query_dto_1 = require("./dto/vendor-dashboard-query.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let VendorDashboardController = class VendorDashboardController {
    constructor(vendorDashboardService) {
        this.vendorDashboardService = vendorDashboardService;
    }
    async getOverview(query) {
        const data = await this.vendorDashboardService.getOverview(query.days);
        return api_response_1.ApiResponse.success(data);
    }
    async getMRR(query) {
        const data = await this.vendorDashboardService.getMRR(query.days);
        return api_response_1.ApiResponse.success(data);
    }
    async getTenantGrowth(query) {
        const data = await this.vendorDashboardService.getTenantGrowth(query.days);
        return api_response_1.ApiResponse.success(data);
    }
    async getPlanDistribution() {
        const data = await this.vendorDashboardService.getPlanDistribution();
        return api_response_1.ApiResponse.success(data);
    }
    async getRevenueByPlan(query) {
        const data = await this.vendorDashboardService.getRevenueByPlan(query.days);
        return api_response_1.ApiResponse.success(data);
    }
};
exports.VendorDashboardController = VendorDashboardController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vendor dashboard overview metrics' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vendor_dashboard_query_dto_1.VendorDashboardQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('dashboard/mrr'),
    (0, swagger_1.ApiOperation)({ summary: 'Get MRR trend over time' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vendor_dashboard_query_dto_1.VendorDashboardQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getMRR", null);
__decorate([
    (0, common_1.Get)('dashboard/growth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant growth over time' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vendor_dashboard_query_dto_1.VendorDashboardQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getTenantGrowth", null);
__decorate([
    (0, common_1.Get)('dashboard/plan-distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription distribution by plan' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getPlanDistribution", null);
__decorate([
    (0, common_1.Get)('dashboard/revenue-by-plan'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue breakdown by plan' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vendor_dashboard_query_dto_1.VendorDashboardQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getRevenueByPlan", null);
exports.VendorDashboardController = VendorDashboardController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/vendor'),
    __metadata("design:paramtypes", [vendor_dashboard_service_1.VendorDashboardService])
], VendorDashboardController);
//# sourceMappingURL=vendor-dashboard.controller.js.map