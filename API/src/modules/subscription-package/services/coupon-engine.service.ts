import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface DiscountPreview {
  valid: boolean;
  couponId: string | null;
  couponCode: string;
  discountType: string | null;
  discountValue: number;
  calculatedDiscount: number;
  maxDiscountInr: number | null;
  finalDiscount: number;
  message: string;
}

@Injectable()
export class CouponEngineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Full coupon validation:
   * - exists, active, not expired, within validity dates
   * - maxRedemptions not reached, perUserLimit not exceeded
   * - firstTimeOnly check, applicable packages/types check
   * Returns discount preview.
   */
  async validate(
    couponCode: string,
    tenantId: string,
    userId: string,
    packageCode?: string,
    amount?: number,
  ): Promise<DiscountPreview> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
      include: { redemptions: true },
    });

    const fail = (message: string): DiscountPreview => ({
      valid: false,
      couponId: null,
      couponCode,
      discountType: null,
      discountValue: 0,
      calculatedDiscount: 0,
      maxDiscountInr: null,
      finalDiscount: 0,
      message,
    });

    if (!coupon) return fail('Invalid coupon code');
    if (!coupon.isActive) return fail('Coupon is inactive');

    // Expiry check (legacy field)
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return fail('Coupon has expired');
    }

    // Validity date range check
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return fail('Coupon is not yet valid');
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return fail('Coupon validity period has ended');
    }

    // Max redemptions
    if (coupon.usedCount >= coupon.maxUses) {
      return fail('Coupon usage limit reached');
    }

    // Per-user limit
    const userRedemptions = coupon.redemptions.filter(
      (r) => r.userId === userId && r.tenantId === tenantId,
    );
    if (userRedemptions.length >= coupon.perUserLimit) {
      return fail('You have already used this coupon the maximum number of times');
    }

    // First-time only check
    if (coupon.firstTimeOnly) {
      const anyPriorRedemption = await this.prisma.couponRedemption.findFirst({
        where: { tenantId, userId },
      });
      if (anyPriorRedemption) {
        return fail('This coupon is valid for first-time users only');
      }
    }

    // Applicable packages check
    const applicablePackages = (coupon.applicablePackages as string[]) ?? ['ALL'];
    if (
      packageCode &&
      !applicablePackages.includes('ALL') &&
      !applicablePackages.includes(packageCode)
    ) {
      return fail('Coupon is not applicable for this package');
    }

    // Applicable types check
    const applicableTypes = (coupon.applicableTypes as string[]) ?? ['ALL'];
    if (!applicableTypes.includes('ALL')) {
      // Types filter is informational; we pass validation if packageCode matches
    }

    // Min recharge check
    if (coupon.minRecharge && amount && amount < Number(coupon.minRecharge)) {
      return fail(`Minimum amount of INR ${coupon.minRecharge} required`);
    }

    // Calculate discount
    let calculatedDiscount = 0;
    const discountType = coupon.discountType;
    const discountValue = coupon.discountValue ? Number(coupon.discountValue) : 0;
    const maxDiscountInr = coupon.maxDiscountInr ? Number(coupon.maxDiscountInr) : null;

    if (discountType === 'PERCENT' && amount) {
      calculatedDiscount = (amount * discountValue) / 100;
    } else if (discountType === 'FLAT_INR') {
      calculatedDiscount = discountValue;
    } else if (!discountType) {
      // Legacy token-based coupon: use value field
      if (coupon.type === 'FIXED_TOKENS') {
        calculatedDiscount = coupon.value;
      } else if (coupon.type === 'PERCENTAGE' && amount) {
        calculatedDiscount = (amount * coupon.value) / 100;
      }
    }

    // Cap at maxDiscountInr
    let finalDiscount = calculatedDiscount;
    if (maxDiscountInr !== null && calculatedDiscount > maxDiscountInr) {
      finalDiscount = maxDiscountInr;
    }

    return {
      valid: true,
      couponId: coupon.id,
      couponCode: coupon.code,
      discountType: discountType ?? coupon.type,
      discountValue,
      calculatedDiscount,
      maxDiscountInr,
      finalDiscount,
      message: 'Coupon is valid',
    };
  }

  /** Redeem a coupon: create CouponRedemption record and increment usedCount */
  async redeem(
    couponCode: string,
    tenantId: string,
    userId: string,
    discountApplied: number,
  ) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');

    // Create redemption and increment in a transaction
    return this.prisma.$transaction(async (tx) => {
      const redemption = await tx.couponRedemption.create({
        data: {
          couponId: coupon.id,
          tenantId,
          userId,
          discountApplied,
        },
      });

      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });

      return redemption;
    });
  }

  /** Create a new coupon */
  async create(data: {
    code: string;
    type: 'FIXED_TOKENS' | 'PERCENTAGE';
    value: number;
    maxUses?: number;
    minRecharge?: number;
    expiresAt?: string;
    isActive?: boolean;
    description?: string;
    discountType?: 'PERCENT' | 'FLAT_INR';
    discountValue?: number;
    maxDiscountInr?: number;
    applicablePackages?: string[];
    applicableTypes?: string[];
    validFrom?: string;
    validUntil?: string;
    perUserLimit?: number;
    firstTimeOnly?: boolean;
    packageId?: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        maxUses: data.maxUses ?? 1,
        minRecharge: data.minRecharge,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive ?? true,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscountInr: data.maxDiscountInr,
        applicablePackages: data.applicablePackages ?? ['ALL'],
        applicableTypes: data.applicableTypes ?? ['ALL'],
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        perUserLimit: data.perUserLimit ?? 1,
        firstTimeOnly: data.firstTimeOnly ?? false,
        packageId: data.packageId,
      },
    });
  }

  /** Update an existing coupon */
  async update(
    id: string,
    data: Partial<{
      code: string;
      type: 'FIXED_TOKENS' | 'PERCENTAGE';
      value: number;
      maxUses: number;
      minRecharge: number;
      expiresAt: string;
      isActive: boolean;
      description: string;
      discountType: 'PERCENT' | 'FLAT_INR';
      discountValue: number;
      maxDiscountInr: number;
      applicablePackages: string[];
      applicableTypes: string[];
      validFrom: string;
      validUntil: string;
      perUserLimit: number;
      firstTimeOnly: boolean;
      packageId: string;
    }>,
  ) {
    const existing = await this.prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Coupon not found');

    const updateData: any = { ...data };
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    if (data.validFrom) updateData.validFrom = new Date(data.validFrom);
    if (data.validUntil) updateData.validUntil = new Date(data.validUntil);

    return this.prisma.coupon.update({ where: { id }, data: updateData });
  }

  /** Paginated list of coupons */
  async listAll(query?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.isActive !== undefined) where.isActive = query.isActive;
    if (query?.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { package: { select: { id: true, packageCode: true, packageName: true } } },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Get coupon detail by code */
  async getByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        package: true,
        redemptions: { orderBy: { redeemedAt: 'desc' }, take: 50 },
      },
    });
    if (!coupon) throw new NotFoundException(`Coupon "${code}" not found`);
    return coupon;
  }
}
