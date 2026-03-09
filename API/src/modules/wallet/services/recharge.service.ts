import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { WalletTransactionService } from './wallet-transaction.service';
import { CouponService } from './coupon.service';

@Injectable()
export class RechargeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly txnService: WalletTransactionService,
    private readonly couponService: CouponService,
  ) {}

  // ─── Recharge Plans CRUD ───

  async listPlans(activeOnly = true) {
    return this.prisma.rechargePlan.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPlan(id: string) {
    const plan = await this.prisma.rechargePlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Recharge plan not found');
    return plan;
  }

  async createPlan(data: {
    name: string;
    amount: number;
    tokens: number;
    bonusTokens?: number;
    description?: string;
    sortOrder?: number;
  }) {
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

  async updatePlan(id: string, data: Partial<{
    name: string;
    amount: number;
    tokens: number;
    bonusTokens: number;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>) {
    await this.getPlan(id);
    return this.prisma.rechargePlan.update({ where: { id }, data });
  }

  async deletePlan(id: string) {
    await this.getPlan(id);
    return this.prisma.rechargePlan.delete({ where: { id } });
  }

  // ─── Recharge Flow ───

  async initiateRecharge(tenantId: string, planId: string, couponCode?: string) {
    const plan = await this.getPlan(planId);
    if (!plan.isActive) throw new BadRequestException('Recharge plan is not active');

    let totalTokens = plan.tokens + plan.bonusTokens;
    let appliedCoupon: { valid: boolean; bonusTokens: number; message: string; couponId?: string } | null = null;

    if (couponCode) {
      const couponResult = await this.couponService.validate(couponCode, Number(plan.amount));
      if (couponResult.valid) {
        appliedCoupon = couponResult;
        totalTokens += couponResult.bonusTokens;
      }
    }

    // In a real implementation, this would create a payment order via PaymentGatewayService
    // For now, return the recharge details for the frontend to process
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

  async completeRecharge(
    tenantId: string,
    planId: string,
    paymentId: string,
    couponCode?: string,
    userId?: string,
  ) {
    const plan = await this.getPlan(planId);

    let totalTokens = plan.tokens + plan.bonusTokens;

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await this.couponService.validate(couponCode, Number(plan.amount));
      if (couponResult.valid) {
        totalTokens += couponResult.bonusTokens;
        await this.couponService.markUsed(couponCode);
      }
    }

    // Credit the wallet
    const result = await this.txnService.credit(tenantId, {
      tokens: totalTokens,
      type: 'CREDIT',
      description: `Recharge: ${plan.name} (₹${plan.amount})`,
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
}
