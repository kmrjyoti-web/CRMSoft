import { GstCalculatorService } from '../services/gst-calculator.service';

describe('GstCalculatorService', () => {
  let service: GstCalculatorService;

  beforeEach(() => {
    service = new GstCalculatorService();
  });

  it('should calculate intra-state GST (CGST + SGST)', () => {
    const result = service.calculate(
      [{ quantity: 2, unitPrice: 1000, gstRate: 18 }],
      false,
    );

    expect(result.subtotal).toBe(2000);
    expect(result.cgstAmount).toBe(180);
    expect(result.sgstAmount).toBe(180);
    expect(result.igstAmount).toBe(0);
    expect(result.totalTax).toBe(360);
    expect(result.totalAmount).toBe(2360);
  });

  it('should calculate inter-state GST (IGST)', () => {
    const result = service.calculate(
      [{ quantity: 1, unitPrice: 5000, gstRate: 18 }],
      true,
    );

    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.igstAmount).toBe(900);
    expect(result.totalTax).toBe(900);
    expect(result.totalAmount).toBe(5900);
  });

  it('should apply line-level percentage discount', () => {
    const result = service.calculate(
      [{ quantity: 1, unitPrice: 1000, discountType: 'PERCENTAGE', discountValue: 10, gstRate: 18 }],
      false,
    );

    expect(result.lines[0].discountAmount).toBe(100);
    expect(result.lines[0].lineTotal).toBe(900);
    expect(result.lines[0].cgstAmount).toBe(81);
    expect(result.lines[0].sgstAmount).toBe(81);
  });

  it('should apply flat discount', () => {
    const result = service.calculate(
      [{ quantity: 1, unitPrice: 2000, discountType: 'FLAT', discountValue: 200 }],
      false,
    );

    expect(result.lines[0].lineTotal).toBe(1800);
    expect(result.discountAmount).toBe(200);
  });

  it('should include cess in calculation', () => {
    const result = service.calculate(
      [{ quantity: 1, unitPrice: 10000, gstRate: 28, cessRate: 12 }],
      true,
    );

    expect(result.igstAmount).toBe(2800);
    expect(result.cessAmount).toBe(1200);
    expect(result.totalTax).toBe(4000);
    expect(result.totalAmount).toBe(14000);
  });

  it('should round off total amount to nearest integer', () => {
    const result = service.calculate(
      [{ quantity: 1, unitPrice: 999, gstRate: 5 }],
      false,
    );

    // 999 + CGST(24.98) + SGST(24.98) = 1048.96 → roundOff 0.04, total 1049
    expect(result.totalAmount).toBe(1049);
    expect(result.roundOff).toBe(0.04);
  });

  it('should apply overall invoice-level discount', () => {
    const result = service.calculate(
      [
        { quantity: 1, unitPrice: 1000, gstRate: 18 },
        { quantity: 1, unitPrice: 2000, gstRate: 18 },
      ],
      false,
      'PERCENTAGE',
      10,
    );

    expect(result.subtotal).toBe(3000);
    expect(result.discountAmount).toBe(300);
    expect(result.taxableAmount).toBe(2700);
  });

  it('should handle zero-rate items', () => {
    const result = service.calculate(
      [{ quantity: 5, unitPrice: 100 }],
      false,
    );

    expect(result.subtotal).toBe(500);
    expect(result.totalTax).toBe(0);
    expect(result.totalAmount).toBe(500);
  });

  it('should determine inter-state from GST numbers', () => {
    expect(service.isInterState('27AAACB1234L1Z5', '27AAACB1234L1Z5')).toBe(false);
    expect(service.isInterState('27AAACB1234L1Z5', '29AAACB1234L1Z5')).toBe(true);
    expect(service.isInterState(null, '29AAACB1234L1Z5')).toBe(false);
  });

  it('should determine inter-state from state names', () => {
    expect(service.isInterStateByName('Maharashtra', 'Maharashtra')).toBe(false);
    expect(service.isInterStateByName('Maharashtra', 'Karnataka')).toBe(true);
    expect(service.isInterStateByName(null, 'Karnataka')).toBe(false);
  });
});
