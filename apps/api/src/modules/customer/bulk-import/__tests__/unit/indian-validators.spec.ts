import { IndianValidatorsService } from '../../services/indian-validators.service';

describe('IndianValidatorsService', () => {
  let service: IndianValidatorsService;

  beforeEach(() => {
    service = new IndianValidatorsService();
  });

  it('should validate valid Indian mobile', () => {
    const result = service.validateIndianMobile('9876543210');
    expect(result.valid).toBe(true);
    expect(result.cleanedValue).toBe('9876543210');
  });

  it('should clean and validate mobile with +91 prefix', () => {
    const result = service.validateIndianMobile('+91 98765 43210');
    expect(result.valid).toBe(true);
    expect(result.cleanedValue).toBe('9876543210');
  });

  it('should reject mobile starting with 0-5', () => {
    expect(service.validateIndianMobile('5876543210').valid).toBe(false);
    expect(service.validateIndianMobile('0123456789').valid).toBe(false);
  });

  it('should validate valid GST number', () => {
    const result = service.validateGST('22AAAAA0000A1Z5');
    expect(result.valid).toBe(true);
  });

  it('should reject GST with invalid state code', () => {
    const result = service.validateGST('99AAAAA0000A1Z5');
    expect(result.valid).toBe(false);
  });

  it('should validate valid PAN', () => {
    const result = service.validatePAN('ABCPD1234E');
    expect(result.valid).toBe(true);
    expect(result.cleanedValue).toBe('ABCPD1234E');
  });

  it('should reject invalid PAN format', () => {
    expect(service.validatePAN('12345ABCDE').valid).toBe(false);
    expect(service.validatePAN('ABCXD1234E').valid).toBe(false);
  });

  it('should validate valid pincode', () => {
    expect(service.validatePincode('110001').valid).toBe(true);
    expect(service.validatePincode('560034').valid).toBe(true);
  });

  it('should reject pincode starting with 0', () => {
    expect(service.validatePincode('010001').valid).toBe(false);
  });

  it('should validate valid email', () => {
    expect(service.validateEmail('test@example.com').valid).toBe(true);
    expect(service.validateEmail('invalid').valid).toBe(false);
  });

  it('should validate TAN number', () => {
    const result = service.validateTAN('ABCD01234E');
    expect(result.valid).toBe(true);
  });

  it('should validate Aadhaar (cannot start with 0 or 1)', () => {
    expect(service.validateAadhaar('234567890123').valid).toBe(true);
    expect(service.validateAadhaar('123456789012').valid).toBe(false);
    expect(service.validateAadhaar('012345678901').valid).toBe(false);
  });
});
