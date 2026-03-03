import { GstCalculatorService } from '../../services/gst-calculator.service';

describe('GstCalculatorService', () => {
  let service: GstCalculatorService;

  beforeEach(() => {
    service = new GstCalculatorService();
  });

  it('should calculate intra-state GST (CGST + SGST)', () => {
    const result = service.calculateGST({
      amount: 1000,
      gstRate: 18,
      isInterState: false,
      taxInclusive: false,
    });

    expect(result.baseAmount).toBe(1000);
    expect(result.cgst).toEqual({ rate: 9, amount: 90 });
    expect(result.sgst).toEqual({ rate: 9, amount: 90 });
    expect(result.igst).toBeNull();
    expect(result.totalTax).toBe(180);
    expect(result.grandTotal).toBe(1180);
  });

  it('should calculate inter-state GST (IGST)', () => {
    const result = service.calculateGST({
      amount: 1000,
      gstRate: 18,
      isInterState: true,
      taxInclusive: false,
    });

    expect(result.baseAmount).toBe(1000);
    expect(result.igst).toEqual({ rate: 18, amount: 180 });
    expect(result.cgst).toBeNull();
    expect(result.sgst).toBeNull();
    expect(result.totalTax).toBe(180);
    expect(result.grandTotal).toBe(1180);
  });

  it('should handle tax-inclusive pricing', () => {
    const result = service.calculateGST({
      amount: 1180,
      gstRate: 18,
      isInterState: false,
      taxInclusive: true,
    });

    expect(result.baseAmount).toBe(1000);
    expect(result.cgst).toEqual({ rate: 9, amount: 90 });
    expect(result.sgst).toEqual({ rate: 9, amount: 90 });
    expect(result.totalTax).toBe(180);
    expect(result.grandTotal).toBe(1180);
  });

  it('should include cess in calculation', () => {
    const result = service.calculateGST({
      amount: 1000,
      gstRate: 18,
      cessRate: 1,
      isInterState: false,
      taxInclusive: false,
    });

    expect(result.cess).toEqual({ rate: 1, amount: 10 });
    expect(result.cgst).toEqual({ rate: 9, amount: 90 });
    expect(result.sgst).toEqual({ rate: 9, amount: 90 });
    expect(result.totalTax).toBe(190);
    expect(result.grandTotal).toBe(1190);
  });

  it('should handle zero GST rate', () => {
    const result = service.calculateGST({
      amount: 1000,
      gstRate: 0,
      isInterState: false,
      taxInclusive: false,
    });

    expect(result.baseAmount).toBe(1000);
    expect(result.cgst).toEqual({ rate: 0, amount: 0 });
    expect(result.sgst).toEqual({ rate: 0, amount: 0 });
    expect(result.cess).toEqual({ rate: 0, amount: 0 });
    expect(result.totalTax).toBe(0);
    expect(result.grandTotal).toBe(1000);
  });
});
