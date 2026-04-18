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
exports.CouponService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const industry_filter_util_1 = require("../../../../common/utils/industry-filter.util");
let CouponService = class CouponService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validate(code, rechargeAmount) {
        const coupon = await this.prisma.coupon.findUnique({ where: { code } });
        if (!coupon) {
            return { valid: false, bonusTokens: 0, message: 'Invalid coupon code' };
        }
        if (!coupon.isActive) {
            return { valid: false, bonusTokens: 0, message: 'Coupon is inactive' };
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return { valid: false, bonusTokens: 0, message: 'Coupon has expired' };
        }
        if (coupon.usedCount >= coupon.maxUses) {
            return { valid: false, bonusTokens: 0, message: 'Coupon usage limit reached' };
        }
        if (coupon.minRecharge && rechargeAmount && rechargeAmount < Number(coupon.minRecharge)) {
            return {
                valid: false,
                bonusTokens: 0,
                message: `Minimum recharge of ?${coupon.minRecharge} required`,
            };
        }
        let bonusTokens = 0;
        if (coupon.type === 'FIXED_TOKENS') {
            bonusTokens = coupon.value;
        }
        else if (coupon.type === 'PERCENTAGE' && rechargeAmount) {
            bonusTokens = Math.floor((rechargeAmount * 100 * coupon.value) / 100);
        }
        return { valid: true, bonusTokens, message: 'Coupon applied', couponId: coupon.id };
    }
    async markUsed(code) {
        await this.prisma.coupon.update({
            where: { code },
            data: { usedCount: { increment: 1 } },
        });
    }
    async findAll(params) {
        const where = { ...(0, industry_filter_util_1.industryFilter)(params?.industryCode) };
        if (params?.isActive !== undefined)
            where.isActive = params.isActive;
        return this.prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findById(id) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        return coupon;
    }
    async create(data) {
        return this.prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                type: data.type,
                value: data.value,
                maxUses: data.maxUses ?? 1,
                minRecharge: data.minRecharge,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        });
    }
    async update(id, data) {
        await this.findById(id);
        const updateData = { ...data };
        if (data.code)
            updateData.code = data.code.toUpperCase();
        if (data.expiresAt)
            updateData.expiresAt = new Date(data.expiresAt);
        return this.prisma.coupon.update({ where: { id }, data: updateData });
    }
    async delete(id) {
        await this.findById(id);
        return this.prisma.coupon.delete({ where: { id } });
    }
};
exports.CouponService = CouponService;
exports.CouponService = CouponService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouponService);
//# sourceMappingURL=coupon.service.js.map