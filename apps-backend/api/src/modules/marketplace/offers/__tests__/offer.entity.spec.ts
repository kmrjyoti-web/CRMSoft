import { OfferEntity } from '../domain/entities/offer.entity';

describe('OfferEntity', () => {
  const baseProps = {
    id: 'offer-1',
    tenantId: 'tenant-1',
    authorId: 'user-1',
    title: '20% OFF Summer Sale',
    offerType: 'ONE_TIME' as const,
    discountType: 'PERCENTAGE' as const,
    discountValue: 20,
    createdById: 'user-1',
    status: 'ACTIVE' as const,
  };

  describe('isActiveNow()', () => {
    it('should return true for ACTIVE offer without expiry', () => {
      const offer = OfferEntity.create(baseProps);
      expect(offer.isActiveNow()).toBe(true);
    });

    it('should return false for non-ACTIVE status', () => {
      const offer = OfferEntity.create({ ...baseProps, status: 'PAUSED' });
      expect(offer.isActiveNow()).toBe(false);
    });

    it('should return false for expired offer', () => {
      const pastDate = new Date(Date.now() - 1000);
      const offer = OfferEntity.create({ ...baseProps, expiresAt: pastDate });
      expect(offer.isActiveNow()).toBe(false);
    });

    it('should return false for FIRST_N_ORDERS when limit reached', () => {
      const offer = OfferEntity.create({
        ...baseProps,
        offerType: 'FIRST_N_ORDERS',
        maxRedemptions: 10,
        currentRedemptions: 10,
      });
      expect(offer.isActiveNow()).toBe(false);
    });
  });

  describe('isEligible()', () => {
    it('should return eligible for active offer with no conditions', () => {
      const offer = OfferEntity.create(baseProps);
      const result = offer.isEligible({ userId: 'user-2' });
      expect(result.eligible).toBe(true);
    });

    it('should return ineligible when offer is paused', () => {
      const offer = OfferEntity.create({ ...baseProps, status: 'PAUSED' });
      const result = offer.isEligible({ userId: 'user-2' });
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not currently active');
    });

    it('should enforce geo conditions', () => {
      const offer = OfferEntity.create({
        ...baseProps,
        conditions: { geo: { allowedStates: ['Maharashtra', 'Gujarat'] } },
      });
      expect(offer.isEligible({ state: 'Karnataka' }).eligible).toBe(false);
      expect(offer.isEligible({ state: 'Maharashtra' }).eligible).toBe(true);
    });

    it('should enforce per-user redemption limit', () => {
      const offer = OfferEntity.create({
        ...baseProps,
        conditions: { maxPerUser: 2 },
      });
      expect(offer.isEligible({ userRedemptionCount: 2 }).eligible).toBe(false);
      expect(offer.isEligible({ userRedemptionCount: 1 }).eligible).toBe(true);
    });

    it('should enforce order value conditions', () => {
      const offer = OfferEntity.create({
        ...baseProps,
        conditions: { orderBased: { minOrderValue: 500 } },
      });
      expect(offer.isEligible({ orderValue: 300 }).eligible).toBe(false);
      expect(offer.isEligible({ orderValue: 1000 }).eligible).toBe(true);
    });
  });

  describe('redeem()', () => {
    it('should increment counter on redeem', () => {
      const offer = OfferEntity.create({ ...baseProps, maxRedemptions: 5, currentRedemptions: 3 });
      offer.redeem('user-2');
      expect(offer.currentRedemptions).toBe(4);
    });

    it('should throw when limit is already reached', () => {
      const offer = OfferEntity.create({ ...baseProps, maxRedemptions: 3, currentRedemptions: 3 });
      expect(() => offer.redeem('user-1')).toThrow('redemption limit');
    });

    it('should close offer when autoCloseOnLimit is true and limit reached', () => {
      const offer = OfferEntity.create({
        ...baseProps,
        maxRedemptions: 3,
        currentRedemptions: 2,
        autoCloseOnLimit: true,
      });
      offer.redeem('user-1');
      expect(offer.status).toBe('CLOSED');
    });
  });

  describe('resetCounter()', () => {
    it('should reset counter for recurring offers', () => {
      const offer = OfferEntity.create({
        ...baseProps,
        offerType: 'DAILY_RECURRING',
        currentRedemptions: 50,
      });
      offer.resetCounter();
      expect(offer.currentRedemptions).toBe(0);
      expect(offer.lastResetAt).toBeInstanceOf(Date);
    });

    it('should throw for non-recurring offers', () => {
      const offer = OfferEntity.create(baseProps);
      expect(() => offer.resetCounter()).toThrow('Cannot reset counter');
    });
  });

  describe('calculateDiscount()', () => {
    it('should calculate percentage discount', () => {
      const offer = OfferEntity.create({ ...baseProps, discountType: 'PERCENTAGE', discountValue: 20 });
      expect(offer.calculateDiscount(1000)).toBe(200);
    });

    it('should calculate flat discount', () => {
      const offer = OfferEntity.create({ ...baseProps, discountType: 'FLAT_AMOUNT', discountValue: 100 });
      expect(offer.calculateDiscount(500)).toBe(100);
    });

    it('should cap flat discount at order value', () => {
      const offer = OfferEntity.create({ ...baseProps, discountType: 'FLAT_AMOUNT', discountValue: 600 });
      expect(offer.calculateDiscount(500)).toBe(500);
    });
  });
});
