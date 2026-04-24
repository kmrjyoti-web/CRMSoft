import { IndianPhone } from '../../ddd/value-objects/indian-phone.vo';

describe('IndianPhone', () => {
  it('should accept valid 10-digit number starting with 9', () => {
    const result = IndianPhone.create('9876543210');
    expect(result.isOk).toBe(true);
    expect(result.value.value).toBe('9876543210');
    expect(result.value.formatted).toBe('+91 98765 43210');
  });

  it('should accept numbers starting with 6, 7, 8, 9', () => {
    expect(IndianPhone.create('6000000000').isOk).toBe(true);
    expect(IndianPhone.create('7000000000').isOk).toBe(true);
    expect(IndianPhone.create('8000000000').isOk).toBe(true);
    expect(IndianPhone.create('9000000000').isOk).toBe(true);
  });

  it('should strip +91 country code prefix', () => {
    const result = IndianPhone.create('+91 98765 43210');
    expect(result.isOk).toBe(true);
    expect(result.value.value).toBe('9876543210');
  });

  it('should strip 91 prefix without +', () => {
    const result = IndianPhone.create('919876543210');
    expect(result.isOk).toBe(true);
    expect(result.value.value).toBe('9876543210');
  });

  it('should provide withCountryCode getter', () => {
    const result = IndianPhone.create('9876543210');
    expect(result.value.withCountryCode).toBe('+919876543210');
  });

  it('should reject numbers not starting with 6-9', () => {
    expect(IndianPhone.create('1234567890').isFail).toBe(true);
    expect(IndianPhone.create('5234567890').isFail).toBe(true);
  });

  it('should reject short numbers', () => {
    expect(IndianPhone.create('98765').isFail).toBe(true);
  });

  it('should reject empty string', () => {
    expect(IndianPhone.create('').isFail).toBe(true);
  });
});
