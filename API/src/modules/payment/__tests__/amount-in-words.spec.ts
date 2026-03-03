import { AmountInWordsService } from '../services/amount-in-words.service';

describe('AmountInWordsService', () => {
  let service: AmountInWordsService;

  beforeEach(() => {
    service = new AmountInWordsService();
  });

  it('should convert zero', () => {
    expect(service.convert(0)).toBe('Zero Rupees Only');
  });

  it('should convert single-digit amounts', () => {
    expect(service.convert(5)).toBe('Five Rupees Only');
  });

  it('should convert two-digit amounts', () => {
    expect(service.convert(42)).toBe('Forty Two Rupees Only');
  });

  it('should convert hundreds', () => {
    expect(service.convert(500)).toBe('Five Hundred Rupees Only');
  });

  it('should convert thousands (Indian system)', () => {
    expect(service.convert(12345)).toBe('Twelve Thousand Three Hundred Forty Five Rupees Only');
  });

  it('should convert lakhs', () => {
    expect(service.convert(150000)).toBe('One Lakh Fifty Thousand Rupees Only');
  });

  it('should convert crores', () => {
    expect(service.convert(12345678)).toBe(
      'One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight Rupees Only',
    );
  });

  it('should handle paise', () => {
    expect(service.convert(1234.50)).toBe(
      'One Thousand Two Hundred Thirty Four Rupees and Fifty Paise Only',
    );
  });

  it('should handle negative amounts', () => {
    const result = service.convert(-500);
    expect(result).toContain('Minus');
    expect(result).toContain('Five Hundred Rupees');
  });

  it('should handle large amounts in crores', () => {
    const result = service.convert(99999999);
    expect(result).toContain('Nine Crore');
    expect(result).toContain('Ninety Nine Lakh');
  });
});
