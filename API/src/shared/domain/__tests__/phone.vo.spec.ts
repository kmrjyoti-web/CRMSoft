import { Phone } from '../value-objects/phone.vo';

describe('Phone Value Object', () => {
  it('should create a valid phone', () => {
    const phone = Phone.create('+91-9876543210');
    expect(phone.value).toBe('+91-9876543210');
  });

  it('should throw on empty string', () => {
    expect(() => Phone.create('')).toThrow('Phone cannot be empty');
  });

  it('should throw on too short number', () => {
    expect(() => Phone.create('12345')).toThrow('Invalid phone number length');
  });

  it('should accept numbers with spaces and dashes', () => {
    const phone = Phone.create('+91 98765 43210');
    expect(phone.value).toBe('+91 98765 43210');
  });

  describe('createOptional()', () => {
    it('should return undefined for empty', () => {
      expect(Phone.createOptional('')).toBeUndefined();
    });

    it('should return Phone for valid', () => {
      expect(Phone.createOptional('+91-9876543210')?.value).toBe('+91-9876543210');
    });
  });

  describe('equals()', () => {
    it('should return true for same phone', () => {
      const a = Phone.create('+91-9876543210');
      const b = Phone.create('+91-9876543210');
      expect(a.equals(b)).toBe(true);
    });
  });
});

