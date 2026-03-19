import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { industryFilter } from '../../../../common/utils/industry-filter.util';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(code: string, rechargeAmount?: number): Promise<{
    valid: boolean;
    bonusTokens: number;
    message: string;
    couponId?: string;
  }> {
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
        message: `Minimum recharge of ₹${coupon.minRecharge} required`,
      };
    }

    let bonusTokens = 0;
    if (coupon.type === 'FIXED_TOKENS') {
      bonusTokens = coupon.value;
    } else if (coupon.type === 'PERCENTAGE' && rechargeAmount) {
      // Percentage of the token equivalent (assume 100 tokens per INR)
      bonusTokens = Math.floor((rechargeAmount * 100 * coupon.value) / 100);
    }

    return { valid: true, bonusTokens, message: 'Coupon applied', couponId: coupon.id };
  }

  async markUsed(code: string) {
    await this.prisma.coupon.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  }

  // ─── Admin CRUD ───

  async findAll(params?: { isActive?: boolean; industryCode?: string }) {
    const where: any = { ...industryFilter(params?.industryCode) };
    if (params?.isActive !== undefined) where.isActive = params.isActive;
    return this.prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(data: {
    code: string;
    type: 'FIXED_TOKENS' | 'PERCENTAGE';
    value: number;
    maxUses?: number;
    minRecharge?: number;
    expiresAt?: string;
  }) {
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

  async update(id: string, data: Partial<{
    code: string;
    type: 'FIXED_TOKENS' | 'PERCENTAGE';
    value: number;
    maxUses: number;
    minRecharge: number;
    expiresAt: string;
    isActive: boolean;
  }>) {
    await this.findById(id);
    const updateData: any = { ...data };
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    return this.prisma.coupon.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.coupon.delete({ where: { id } });
  }
}
