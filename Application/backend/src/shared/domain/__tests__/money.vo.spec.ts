import { Money } from '../value-objects/money.vo';

describe('Money Value Object', () => {
  it('should create money with amount and currency', () => {
    const m = Money.create(1000, 'INR');
    expect(m.amount).toBe(1000);
    expect(m.currency).toBe('INR');
  });

  it('should default to INR', () => {
    const m = Money.create(500);
    expect(m.currency).toBe('INR');
  });

  it('should throw on negative amount', () => {
    expect(() => Money.create(-100)).toThrow('cannot be negative');
  });

  it('should create zero', () => {
    const m = Money.zero();
    expect(m.amount).toBe(0);
    expect(m.isZero()).toBe(true);
  });

  describe('add()', () => {
    it('should add two money values', () => {
      const a = Money.create(100);
      const b = Money.create(200);
      expect(a.add(b).amount).toBe(300);
    });

    it('should throw when adding different currencies', () => {
      const a = Money.create(100, 'INR');
      const b = Money.create(100, 'USD');
      expect(() => a.add(b)).toThrow('Cannot add different currencies');
    });
  });

  describe('subtract()', () => {
    it('should subtract money values', () => {
      const a = Money.create(300);
      const b = Money.create(100);
      expect(a.subtract(b).amount).toBe(200);
    });
  });

  describe('multiply()', () => {
    it('should multiply by factor', () => {
      const m = Money.create(100);
      expect(m.multiply(3).amount).toBe(300);
    });
  });

  describe('equals()', () => {
    it('should be equal for same amount and currency', () => {
      expect(Money.create(100, 'INR').equals(Money.create(100, 'INR'))).toBe(true);
    });

    it('should not be equal for different amounts', () => {
      expect(Money.create(100).equals(Money.create(200))).toBe(false);
    });
  });

  describe('isGreaterThan()', () => {
    it('should return true when greater', () => {
      expect(Money.create(200).isGreaterThan(Money.create(100))).toBe(true);
    });

    it('should return false when less', () => {
      expect(Money.create(50).isGreaterThan(Money.create(100))).toBe(false);
    });
  });
});

