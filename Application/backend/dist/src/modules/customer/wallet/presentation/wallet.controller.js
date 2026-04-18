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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const wallet_service_1 = require("../services/wallet.service");
const wallet_transaction_service_1 = require("../services/wallet-transaction.service");
const recharge_service_1 = require("../services/recharge.service");
const coupon_service_1 = require("../services/coupon.service");
const service_rate_service_1 = require("../services/service-rate.service");
const wallet_query_dto_1 = require("./dto/wallet-query.dto");
const recharge_dto_1 = require("./dto/recharge.dto");
const apply_coupon_dto_1 = require("./dto/apply-coupon.dto");
const cost_estimate_dto_1 = require("./dto/cost-estimate.dto");
let WalletController = class WalletController {
    constructor(walletService, txnService, rechargeService, couponService, rateService) {
        this.walletService = walletService;
        this.txnService = txnService;
        this.rechargeService = rechargeService;
        this.couponService = couponService;
        this.rateService = rateService;
    }
    async getBalance(tenantId) {
        if (!tenantId) {
            return api_response_1.ApiResponse.success({
                id: null,
                balance: 0,
                promoBalance: 0,
                totalAvailable: 0,
                lifetimeCredit: 0,
                lifetimeDebit: 0,
                currency: 'INR',
                tokenRate: 100,
                isActive: false,
            });
        }
        const balance = await this.walletService.getBalance(tenantId);
        return api_response_1.ApiResponse.success(balance);
    }
    async getTransactions(tenantId, query) {
        const result = await this.txnService.getHistory(tenantId, query);
        return api_response_1.ApiResponse.success(result.data, undefined, {
            total: result.total,
            page: result.page,
            limit: result.limit,
        });
    }
    async initiateRecharge(dto, tenantId) {
        const result = await this.rechargeService.initiateRecharge(tenantId, dto.planId, dto.couponCode);
        return api_response_1.ApiResponse.success(result);
    }
    async completeRecharge(dto, tenantId, userId) {
        const result = await this.rechargeService.completeRecharge(tenantId, dto.planId, dto.paymentId, dto.couponCode, userId);
        return api_response_1.ApiResponse.success(result, 'Recharge successful');
    }
    async applyCoupon(dto) {
        const result = await this.couponService.validate(dto.code, dto.rechargeAmount);
        return api_response_1.ApiResponse.success(result);
    }
    async getRechargePlans() {
        const plans = await this.rechargeService.listPlans(true);
        return api_response_1.ApiResponse.success(plans);
    }
    async estimateCost(dto, tenantId) {
        const estimate = await this.rateService.estimateCost(dto.serviceKey);
        const balance = await this.walletService.getBalance(tenantId);
        return api_response_1.ApiResponse.success({
            ...estimate,
            currentBalance: balance.totalAvailable,
            balanceAfter: estimate ? balance.totalAvailable - estimate.finalTokens : balance.totalAvailable,
            sufficient: estimate ? balance.totalAvailable >= estimate.finalTokens : true,
        });
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance and summary' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wallet_query_dto_1.WalletTransactionQueryDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('recharge'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a recharge' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recharge_dto_1.InitiateRechargeDto, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "initiateRecharge", null);
__decorate([
    (0, common_1.Post)('recharge/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify payment and credit tokens' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recharge_dto_1.CompleteRechargeDto, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "completeRecharge", null);
__decorate([
    (0, common_1.Post)('apply-coupon'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate and preview coupon' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apply_coupon_dto_1.ApplyCouponDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "applyCoupon", null);
__decorate([
    (0, common_1.Get)('recharge-plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List available recharge plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getRechargePlans", null);
__decorate([
    (0, common_1.Post)('estimate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get cost estimate for a service' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cost_estimate_dto_1.CostEstimateDto, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "estimateCost", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        wallet_transaction_service_1.WalletTransactionService,
        recharge_service_1.RechargeService,
        coupon_service_1.CouponService,
        service_rate_service_1.ServiceRateService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map