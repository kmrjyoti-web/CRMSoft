import { QuotationCalculatorService } from '../../services/quotation-calculator.service';

describe('QuotationCalculatorService', () => {
  let calculator: QuotationCalculatorService;

  beforeEach(() => {
    const mockConfig = { get: jest.fn().mockReturnValue('Maharashtra') };
    calculator = new QuotationCalculatorService({} as any, mockConfig as any);
  });

  it('should calculate line total = qty × unitPrice - discount', () => {
    const result = calculator.calculateLineItem(
      { quantity: 2, unitPrice: 10000 }, false,
    );
    expect(result.lineTotal).toBe(20000);
  });

  it('should calculate percentage discount: 10% of ₹10,000 = ₹1,000', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 10000, discountType: 'PERCENTAGE', discountValue: 10 }, false,
    );
    expect(result.discountAmount).toBe(1000);
    expect(result.lineTotal).toBe(9000);
  });

  it('should calculate flat discount: ₹500 off', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 10000, discountType: 'FLAT', discountValue: 500 }, false,
    );
    expect(result.discountAmount).toBe(500);
    expect(result.lineTotal).toBe(9500);
  });

  it('should split CGST + SGST for intra-state (18% → 9% + 9%)', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 10000, gstRate: 18 }, false,
    );
    expect(result.taxAmount).toBe(1800);
    expect(result.cgstAmount).toBe(900);
    expect(result.sgstAmount).toBe(900);
    expect(result.igstAmount).toBe(0);
  });

  it('should use IGST for inter-state (full 18%)', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 10000, gstRate: 18 }, true,
    );
    expect(result.taxAmount).toBe(1800);
    expect(result.igstAmount).toBe(1800);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
  });

  it('should add cess on top of GST', () => {
    const result = calculator.calculateLineItem(
      { quantity: 1, unitPrice: 10000, gstRate: 18, cessRate: 5 }, false,
    );
    expect(result.cessAmount).toBe(500);
    expect(result.totalWithTax).toBe(10000 + 1800 + 500);
  });

  it('should determine inter-state correctly', () => {
    expect(calculator.isInterState('Maharashtra')).toBe(false);
    expect(calculator.isInterState('Karnataka')).toBe(true);
    expect(calculator.isInterState(undefined)).toBe(false);
  });
});
