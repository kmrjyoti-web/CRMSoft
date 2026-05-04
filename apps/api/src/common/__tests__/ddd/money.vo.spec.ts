import { Money } from '../../ddd/value-objects/money.vo';

describe('Money', () => {
  describe('create()', () => {
    it('should create Money in INR from decimal amount', () => {
      const result = Money.create(1500.50);
      expect(result.isOk).toBe(true);
      expect(result.value.amount).toBe(1500.50);
      expect(result.value.amountInPaisa).toBe(150050);
      expect(result.value.currency).toBe('INR');
    });

    it('should reject NaN amount', () => {
      const result = Money.create(NaN);
      expect(result.isFail).toBe(true);
    });

    it('should reject Infinity', () => {
      const result = Money.create(Infinity);
      expect(result.isFail).toBe(true);
    });

    it('should reject negative amounts', () => {
      const result = Money.create(-100);
      expect(result.isFail).toBe(true);
    });

    it('should create zero', () => {
      const zero = Money.zero();
      expect(zero.amount).toBe(0);
      expect(zero.amountInPaisa).toBe(0);
    });
  });

  describe('arithmetic', () => {
    it('should add two Money values correctly', () => {
      const a = Money.create(100).value;
      const b = Money.create(200).value;
      const sum = a.add(b);
      expect(sum.amount).toBe(300);
      expect(sum.amountInPaisa).toBe(30000);
    });

    it('should subtract correctly', () => {
      const a = Money.create(500).value;
      const b = Money.create(200).value;
      const result = a.subtract(b);
      expect(result.isOk).toBe(true);
      expect(result.value.amount).toBe(300);
    });

    it('should fail subtract when result would be negative', () => {
      const a = Money.create(100).value;
      const b = Money.create(500).value;
      expect(a.subtract(b).isFail).toBe(true);
    });

    it('should multiply by factor', () => {
      const price = Money.create(100).value;
      const total = price.multiply(3);
      expect(total.amount).toBe(300);
    });
  });

  describe('applyGST()', () => {
    it('should calculate 18% GST correctly', () => {
      const price = Money.create(1000).value;
      const { base, gst, total } = price.applyGST(18);
      expect(base.amount).toBe(1000);
      expect(gst.amount).toBe(180);
      expect(total.amount).toBe(1180);
    });
  });

  describe('formatINR()', () => {
    it('should format with INR locale', () => {
      const money = Money.create(1500.50).value;
      const formatted = money.formatINR();
      expect(formatted).toContain('1,500.50');
    });
  });
});
