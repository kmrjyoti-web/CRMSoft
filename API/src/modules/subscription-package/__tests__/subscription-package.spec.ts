import { SubscriptionPackageService } from '../services/subscription-package.service';
import { CouponEngineService } from '../services/coupon-engine.service';
import { NotFoundException } from '@nestjs/common';

// ─── Mock Prisma ───

const mockPrisma = {
  subscriptionPackage: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  coupon: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  couponRedemption: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

// ═══════════════════════════════════════════════════════
// SubscriptionPackageService
// ═══════════════════════════════════════════════════════

describe('SubscriptionPackageService', () => {
  let service: SubscriptionPackageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubscriptionPackageService(mockPrisma);
  });

  it('should list all packages ordered by planLevel', async () => {
    const packages = [
      { id: '1', packageCode: 'STARTER', planLevel: 1 },
      { id: '2', packageCode: 'PRO', planLevel: 2 },
    ];
    mockPrisma.subscriptionPackage.findMany.mockResolvedValue(packages);

    const result = await service.listAll();
    expect(result).toEqual(packages);
    expect(mockPrisma.subscriptionPackage.findMany).toHaveBeenCalledWith({
      where: { industryCode: null },
      orderBy: { planLevel: 'asc' },
      include: { coupons: { where: { isActive: true }, select: { id: true, code: true } } },
    });
  });

  it('should filter active-only packages', async () => {
    mockPrisma.subscriptionPackage.findMany.mockResolvedValue([]);
    await service.listAll(true);
    expect(mockPrisma.subscriptionPackage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { industryCode: null, isActive: true } }),
    );
  });

  it('should get a package by code', async () => {
    const pkg = { id: '1', packageCode: 'STARTER' };
    mockPrisma.subscriptionPackage.findUnique.mockResolvedValue(pkg);

    const result = await service.getByCode('STARTER');
    expect(result).toEqual(pkg);
  });

  it('should throw NotFoundException if package code not found', async () => {
    mockPrisma.subscriptionPackage.findUnique.mockResolvedValue(null);
    await expect(service.getByCode('NOPE')).rejects.toThrow(NotFoundException);
  });

  it('should create a package with defaults', async () => {
    const input = {
      packageCode: 'basic',
      packageName: 'Basic Plan',
      priceMonthlyInr: 499,
      priceYearlyInr: 4999,
      planLevel: 1,
    };
    const created = { id: '1', ...input, packageCode: 'BASIC' };
    mockPrisma.subscriptionPackage.create.mockResolvedValue(created);

    const result = await service.create(input);
    expect(result.packageCode).toBe('BASIC');
    expect(mockPrisma.subscriptionPackage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        packageCode: 'BASIC',
        trialDays: 14,
        yearlyDiscountPct: 20,
      }),
    });
  });

  it('should update a package', async () => {
    mockPrisma.subscriptionPackage.findUnique.mockResolvedValue({ id: '1' });
    mockPrisma.subscriptionPackage.update.mockResolvedValue({ id: '1', packageName: 'Updated' });

    const result = await service.update('1', { packageName: 'Updated' });
    expect(result.packageName).toBe('Updated');
  });

  it('should throw NotFoundException on update if not found', async () => {
    mockPrisma.subscriptionPackage.findUnique.mockResolvedValue(null);
    await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
  });

  it('should deactivate a package', async () => {
    mockPrisma.subscriptionPackage.findUnique.mockResolvedValue({ id: '1', isActive: true });
    mockPrisma.subscriptionPackage.update.mockResolvedValue({ id: '1', isActive: false });

    const result = await service.deactivate('1');
    expect(result.isActive).toBe(false);
    expect(mockPrisma.subscriptionPackage.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { isActive: false },
    });
  });

  it('should return featured packages', async () => {
    const featured = [{ id: '1', isFeatured: true }];
    mockPrisma.subscriptionPackage.findMany.mockResolvedValue(featured);

    const result = await service.getFeatured();
    expect(result).toEqual(featured);
    expect(mockPrisma.subscriptionPackage.findMany).toHaveBeenCalledWith({
      where: { isActive: true, isFeatured: true, industryCode: null },
      orderBy: { sortOrder: 'asc' },
    });
  });
});

// ═══════════════════════════════════════════════════════
// CouponEngineService
// ═══════════════════════════════════════════════════════

describe('CouponEngineService', () => {
  let engine: CouponEngineService;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new CouponEngineService(mockPrisma);
  });

  const baseCoupon = {
    id: 'c1',
    code: 'SAVE20',
    type: 'FIXED_TOKENS' as const,
    value: 100,
    maxUses: 10,
    usedCount: 0,
    minRecharge: null,
    expiresAt: null,
    isActive: true,
    discountType: 'PERCENT' as const,
    discountValue: 20,
    maxDiscountInr: 500,
    applicablePackages: ['ALL'],
    applicableTypes: ['ALL'],
    validFrom: null,
    validUntil: null,
    perUserLimit: 2,
    firstTimeOnly: false,
    redemptions: [],
  };

  it('should return invalid for non-existent coupon', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    const result = await engine.validate('NOPE', 't1', 'u1');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Invalid coupon code');
  });

  it('should return invalid for inactive coupon', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({ ...baseCoupon, isActive: false, redemptions: [] });
    const result = await engine.validate('SAVE20', 't1', 'u1');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Coupon is inactive');
  });

  it('should return invalid for expired coupon', async () => {
    const past = new Date('2020-01-01');
    mockPrisma.coupon.findUnique.mockResolvedValue({
      ...baseCoupon, expiresAt: past, redemptions: [],
    });
    const result = await engine.validate('SAVE20', 't1', 'u1');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Coupon has expired');
  });

  it('should return invalid when max uses reached', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      ...baseCoupon, usedCount: 10, redemptions: [],
    });
    const result = await engine.validate('SAVE20', 't1', 'u1');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Coupon usage limit reached');
  });

  it('should return invalid when per-user limit exceeded', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      ...baseCoupon,
      perUserLimit: 1,
      redemptions: [{ userId: 'u1', tenantId: 't1' }],
    });
    const result = await engine.validate('SAVE20', 't1', 'u1');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('maximum number of times');
  });

  it('should return invalid for first-time-only when user has prior redemptions', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      ...baseCoupon, firstTimeOnly: true, redemptions: [],
    });
    mockPrisma.couponRedemption.findFirst.mockResolvedValue({ id: 'r1' });

    const result = await engine.validate('SAVE20', 't1', 'u1');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('first-time');
  });

  it('should return invalid for non-applicable package', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      ...baseCoupon, applicablePackages: ['PRO', 'ENTERPRISE'], redemptions: [],
    });
    const result = await engine.validate('SAVE20', 't1', 'u1', 'STARTER');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('not applicable');
  });

  it('should calculate PERCENT discount capped at maxDiscountInr', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      ...baseCoupon, redemptions: [],
    });
    // 20% of 5000 = 1000, but cap at 500
    const result = await engine.validate('SAVE20', 't1', 'u1', undefined, 5000);
    expect(result.valid).toBe(true);
    expect(result.calculatedDiscount).toBe(1000);
    expect(result.finalDiscount).toBe(500);
  });

  it('should calculate FLAT_INR discount', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      ...baseCoupon,
      discountType: 'FLAT_INR',
      discountValue: 200,
      maxDiscountInr: null,
      redemptions: [],
    });
    const result = await engine.validate('SAVE20', 't1', 'u1', undefined, 1000);
    expect(result.valid).toBe(true);
    expect(result.finalDiscount).toBe(200);
  });

  it('should redeem a coupon within a transaction', async () => {
    const coupon = { id: 'c1', code: 'SAVE20' };
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon);

    const mockTx = {
      couponRedemption: { create: jest.fn().mockResolvedValue({ id: 'r1', couponId: 'c1' }) },
      coupon: { update: jest.fn().mockResolvedValue({ ...coupon, usedCount: 1 }) },
    };
    mockPrisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

    const result = await engine.redeem('SAVE20', 't1', 'u1', 200);
    expect(result.id).toBe('r1');
    expect(mockTx.couponRedemption.create).toHaveBeenCalled();
    expect(mockTx.coupon.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { usedCount: { increment: 1 } },
    });
  });

  it('should throw NotFoundException on redeem if coupon not found', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    await expect(engine.redeem('NOPE', 't1', 'u1', 100)).rejects.toThrow(NotFoundException);
  });

  it('should create a coupon with uppercased code', async () => {
    const input = { code: 'welcome50', type: 'PERCENTAGE' as const, value: 50 };
    mockPrisma.coupon.create.mockResolvedValue({ id: 'c2', code: 'WELCOME50' });

    const result = await engine.create(input);
    expect(result.code).toBe('WELCOME50');
  });

  it('should list coupons with pagination', async () => {
    mockPrisma.coupon.findMany.mockResolvedValue([{ id: 'c1' }]);
    mockPrisma.coupon.count.mockResolvedValue(1);

    const result = await engine.listAll({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should get coupon by code', async () => {
    const coupon = { id: 'c1', code: 'SAVE20' };
    mockPrisma.coupon.findUnique.mockResolvedValue(coupon);

    const result = await engine.getByCode('save20');
    expect(result.code).toBe('SAVE20');
  });

  it('should throw NotFoundException for unknown coupon code', async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    await expect(engine.getByCode('NOPE')).rejects.toThrow(NotFoundException);
  });
});
