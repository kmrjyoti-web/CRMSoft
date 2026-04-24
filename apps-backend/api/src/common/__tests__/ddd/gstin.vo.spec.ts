import { GSTIN } from '../../ddd/value-objects/gstin.vo';

describe('GSTIN', () => {
  it('should accept valid GSTIN', () => {
    const result = GSTIN.create('27AAPFU0939F1ZV');
    expect(result.isOk).toBe(true);
    expect(result.value.value).toBe('27AAPFU0939F1ZV');
    expect(result.value.stateCode).toBe('27');
    expect(result.value.stateName).toBe('Maharashtra');
  });

  it('should normalize lowercase to uppercase', () => {
    const result = GSTIN.create('27aapfu0939f1zv');
    expect(result.isOk).toBe(true);
    expect(result.value.value).toBe('27AAPFU0939F1ZV');
  });

  it('should extract PAN from GSTIN', () => {
    const result = GSTIN.create('27AAPFU0939F1ZV');
    expect(result.value.pan).toBe('AAPFU0939F');
  });

  it('should reject invalid GSTIN', () => {
    expect(GSTIN.create('INVALID').isFail).toBe(true);
    expect(GSTIN.create('').isFail).toBe(true);
    expect(GSTIN.create('123456789012345').isFail).toBe(true);
  });

  it('should reject GSTIN shorter than 15 chars', () => {
    expect(GSTIN.create('27AAPFU0939').isFail).toBe(true);
  });
});
