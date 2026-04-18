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
exports.WalletAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const super_admin_guard_1 = require("../../../core/identity/tenant/infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../../../core/identity/tenant/infrastructure/decorators/super-admin-route.decorator");
const wallet_service_1 = require("../services/wallet.service");
const wallet_transaction_service_1 = require("../services/wallet-transaction.service");
const recharge_service_1 = require("../services/recharge.service");
const coupon_service_1 = require("../services/coupon.service");
const service_rate_service_1 = require("../services/service-rate.service");
const wallet_analytics_service_1 = require("../services/wallet-analytics.service");
const debit_wallet_dto_1 = require("./dto/debit-wallet.dto");
const create_recharge_plan_dto_1 = require("./dto/create-recharge-plan.dto");
const create_coupon_dto_1 = require("./dto/create-coupon.dto");
const create_service_rate_dto_1 = require("./dto/create-service-rate.dto");
let WalletAdminController = class WalletAdminController {
    constructor(walletService, txnService, rechargeService, couponService, rateService, analyticsService) {
        this.walletService = walletService;
        this.txnService = txnService;
        this.rechargeService = rechargeService;
        this.couponService = couponService;
        this.rateService = rateService;
        this.analyticsService = analyticsService;
    }
    async listWallets(page, limit) {
        const result = await this.walletService.findAll({ page, limit });
        return api_response_1.ApiResponse.success(result.data, undefined, {
            total: result.total,
            page: result.page,
            limit: result.limit,
        });
    }
    async getWallet(tenantId) {
        const balance = await this.walletService.getBalance(tenantId);
        return api_response_1.ApiResponse.success(balance);
    }
    async creditWallet(tenantId, dto, adminId) {
        const result = await this.txnService.credit(tenantId, {
            tokens: dto.tokens,
            type: 'ADJUSTMENT',
            description: dto.description,
            referenceType: 'ADMIN_CREDIT',
            createdById: adminId,
        });
        return api_response_1.ApiResponse.success(result, 'Wallet credited');
    }
    async debitWallet(tenantId, dto, adminId) {
        const result = await this.txnService.debit(tenantId, {
            tokens: dto.tokens,
            description: dto.description,
            referenceType: 'ADMIN_DEBIT',
            createdById: adminId,
        });
        return api_response_1.ApiResponse.success(result, 'Wallet debited');
    }
    async listRechargePlans() {
        const plans = await this.rechargeService.listPlans(false);
        return api_response_1.ApiResponse.success(plans);
    }
    async createRechargePlan(dto) {
        const plan = await this.rechargeService.createPlan(dto);
        return api_response_1.ApiResponse.success(plan, 'Recharge plan created');
    }
    async updateRechargePlan(id, dto) {
        const plan = await this.rechargeService.updatePlan(id, dto);
        return api_response_1.ApiResponse.success(plan, 'Recharge plan updated');
    }
    async deleteRechargePlan(id) {
        await this.rechargeService.deletePlan(id);
        return api_response_1.ApiResponse.success(null, 'Recharge plan deleted');
    }
    async listCoupons() {
        const coupons = await this.couponService.findAll();
        return api_response_1.ApiResponse.success(coupons);
    }
    async createCoupon(dto) {
        const coupon = await this.couponService.create(dto);
        return api_response_1.ApiResponse.success(coupon, 'Coupon created');
    }
    async updateCoupon(id, dto) {
        const coupon = await this.couponService.update(id, dto);
        return api_response_1.ApiResponse.success(coupon, 'Coupon updated');
    }
    async deleteCoupon(id) {
        await this.couponService.delete(id);
        return api_response_1.ApiResponse.success(null, 'Coupon deleted');
    }
    async listServiceRates(category) {
        const rates = await this.rateService.findAll({ category });
        return api_response_1.ApiResponse.success(rates);
    }
    async createServiceRate(dto) {
        const rate = await this.rateService.create(dto);
        return api_response_1.ApiResponse.success(rate, 'Service rate created');
    }
    async updateServiceRate(id, dto) {
        const rate = await this.rateService.update(id, dto);
        return api_response_1.ApiResponse.success(rate, 'Service rate updated');
    }
    async deleteServiceRate(id) {
        await this.rateService.delete(id);
        return api_response_1.ApiResponse.success(null, 'Service rate deleted');
    }
    async getRevenueSummary(days) {
        const summary = await this.analyticsService.getRevenueSummary(days ?? 30);
        return api_response_1.ApiResponse.success(summary);
    }
    async getSpendByCategory(tenantId, days) {
        const data = await this.analyticsService.getSpendByCategory(tenantId, days ?? 30);
        return api_response_1.ApiResponse.success(data);
    }
    async getTopServices(tenantId, days) {
        const data = await this.analyticsService.getTopServices(tenantId, days ?? 30);
        return api_response_1.ApiResponse.success(data);
    }
    async getDailyTrend(tenantId, days) {
        const data = await this.analyticsService.getDailySpendTrend(tenantId, days ?? 30);
        return api_response_1.ApiResponse.success(data);
    }
};
exports.WalletAdminController = WalletAdminController;
__decorate([
    (0, common_1.Get)('wallets'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tenant wallets' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "listWallets", null);
__decorate([
    (0, common_1.Get)('wallets/:tenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet for a tenant' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Post)('wallets/:tenantId/credit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Manual credit to tenant wallet' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, debit_wallet_dto_1.DebitWalletDto, String]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "creditWallet", null);
__decorate([
    (0, common_1.Post)('wallets/:tenantId/debit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Manual debit from tenant wallet' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, debit_wallet_dto_1.DebitWalletDto, String]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "debitWallet", null);
__decorate([
    (0, common_1.Get)('recharge-plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List all recharge plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "listRechargePlans", null);
__decorate([
    (0, common_1.Post)('recharge-plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Create recharge plan' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_recharge_plan_dto_1.CreateRechargePlanDto]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "createRechargePlan", null);
__decorate([
    (0, common_1.Put)('recharge-plans/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update recharge plan' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_recharge_plan_dto_1.UpdateRechargePlanDto]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "updateRechargePlan", null);
__decorate([
    (0, common_1.Delete)('recharge-plans/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete recharge plan' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "deleteRechargePlan", null);
__decorate([
    (0, common_1.Get)('coupons'),
    (0, swagger_1.ApiOperation)({ summary: 'List all coupons' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "listCoupons", null);
__decorate([
    (0, common_1.Post)('coupons'),
    (0, swagger_1.ApiOperation)({ summary: 'Create coupon' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "createCoupon", null);
__decorate([
    (0, common_1.Put)('coupons/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update coupon' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_coupon_dto_1.UpdateCouponDto]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "updateCoupon", null);
__decorate([
    (0, common_1.Delete)('coupons/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete coupon' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "deleteCoupon", null);
__decorate([
    (0, common_1.Get)('service-rates'),
    (0, swagger_1.ApiOperation)({ summary: 'List all service rates' }),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "listServiceRates", null);
__decorate([
    (0, common_1.Post)('service-rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create service rate' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_rate_dto_1.CreateServiceRateDto]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "createServiceRate", null);
__decorate([
    (0, common_1.Put)('service-rates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update service rate' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_service_rate_dto_1.UpdateServiceRateDto]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "updateServiceRate", null);
__decorate([
    (0, common_1.Delete)('service-rates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service rate' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "deleteServiceRate", null);
__decorate([
    (0, common_1.Get)('wallet-analytics/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Platform revenue summary' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "getRevenueSummary", null);
__decorate([
    (0, common_1.Get)('wallet-analytics/spend-by-category'),
    (0, swagger_1.ApiOperation)({ summary: 'Spend breakdown by category' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "getSpendByCategory", null);
__decorate([
    (0, common_1.Get)('wallet-analytics/top-services'),
    (0, swagger_1.ApiOperation)({ summary: 'Top services by spend' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "getTopServices", null);
__decorate([
    (0, common_1.Get)('wallet-analytics/daily-trend'),
    (0, swagger_1.ApiOperation)({ summary: 'Daily spend trend' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], WalletAdminController.prototype, "getDailyTrend", null);
exports.WalletAdminController = WalletAdminController = __decorate([
    (0, swagger_1.ApiTags)('Wallet Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        wallet_transaction_service_1.WalletTransactionService,
        recharge_service_1.RechargeService,
        coupon_service_1.CouponService,
        service_rate_service_1.ServiceRateService,
        wallet_analytics_service_1.WalletAnalyticsService])
], WalletAdminController);
//# sourceMappingURL=wallet-admin.controller.js.map