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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RechargeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const wallet_transaction_service_1 = require("./wallet-transaction.service");
const coupon_service_1 = require("./coupon.service");
const industry_filter_util_1 = require("../../../../common/utils/industry-filter.util");
let RechargeService = class RechargeService {
    constructor(prisma, txnService, couponService) {
        this.prisma = prisma;
        this.txnService = txnService;
        this.couponService = couponService;
    }
    async listPlans(activeOnly = true, industryCode) {
        const where = { ...(0, industry_filter_util_1.industryFilter)(industryCode) };
        if (activeOnly)
            where.isActive = true;
        return this.prisma.rechargePlan.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            orderBy: { sortOrder: 'asc' },
        });
    }
    async getPlan(id) {
        const plan = await this.prisma.rechargePlan.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Recharge plan not found');
        return plan;
    }
    async createPlan(data) {
        return this.prisma.rechargePlan.create({
            data: {
                name: data.name,
                amount: data.amount,
                tokens: data.tokens,
                bonusTokens: data.bonusTokens ?? 0,
                description: data.description,
                sortOrder: data.sortOrder ?? 0,
            },
        });
    }
    async updatePlan(id, data) {
        await this.getPlan(id);
        return this.prisma.rechargePlan.update({ where: { id }, data });
    }
    async deletePlan(id) {
        await this.getPlan(id);
        return this.prisma.rechargePlan.delete({ where: { id } });
    }
    async initiateRecharge(tenantId, planId, couponCode) {
        const plan = await this.getPlan(planId);
        if (!plan.isActive)
            throw new common_1.BadRequestException('Recharge plan is not active');
        let totalTokens = plan.tokens + plan.bonusTokens;
        let appliedCoupon = null;
        if (couponCode) {
            const couponResult = await this.couponService.validate(couponCode, Number(plan.amount));
            if (couponResult.valid) {
                appliedCoupon = couponResult;
                totalTokens += couponResult.bonusTokens;
            }
        }
        return {
            planId: plan.id,
            planName: plan.name,
            amount: plan.amount,
            baseTokens: plan.tokens,
            bonusTokens: plan.bonusTokens,
            couponBonus: appliedCoupon?.bonusTokens ?? 0,
            totalTokens,
            coupon: appliedCoupon,
        };
    }
    async completeRecharge(tenantId, planId, paymentId, couponCode, userId) {
        const plan = await this.getPlan(planId);
        let totalTokens = plan.tokens + plan.bonusTokens;
        if (couponCode) {
            const couponResult = await this.couponService.validate(couponCode, Number(plan.amount));
            if (couponResult.valid) {
                totalTokens += couponResult.bonusTokens;
                await this.couponService.markUsed(couponCode);
            }
        }
        const result = await this.txnService.credit(tenantId, {
            tokens: totalTokens,
            type: 'CREDIT',
            description: `Recharge: ${plan.name} (?${plan.amount})`,
            referenceType: 'RECHARGE',
            referenceId: paymentId,
            metadata: {
                planId: plan.id,
                planName: plan.name,
                amount: Number(plan.amount),
                baseTokens: plan.tokens,
                bonusTokens: plan.bonusTokens,
                couponCode,
                paymentId,
            },
            createdById: userId,
        });
        return result;
    }
};
exports.RechargeService = RechargeService;
exports.RechargeService = RechargeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_transaction_service_1.WalletTransactionService,
        coupon_service_1.CouponService])
], RechargeService);
//# sourceMappingURL=recharge.service.js.map