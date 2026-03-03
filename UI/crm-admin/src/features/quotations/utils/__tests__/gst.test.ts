import { calculateLineItem, splitGst, calculateSummary } from "../gst";

describe("calculateLineItem", () => {
  it("calculates basic line item without discount", () => {
    const result = calculateLineItem({ quantity: 10, unitPrice: 100, gstRate: 18 });
    expect(result.grossAmount).toBe(1000);
    expect(result.discountAmount).toBe(0);
    expect(result.lineTotal).toBe(1000);
    expect(result.taxAmount).toBe(180);
    expect(result.totalWithTax).toBe(1180);
  });

  it("calculates line item with percentage discount", () => {
    const result = calculateLineItem({
      quantity: 5,
      unitPrice: 200,
      discountType: "PERCENTAGE",
      discountValue: 10,
      gstRate: 18,
    });
    expect(result.grossAmount).toBe(1000);
    expect(result.discountAmount).toBe(100);
    expect(result.lineTotal).toBe(900);
    expect(result.taxAmount).toBe(162);
    expect(result.totalWithTax).toBe(1062);
  });

  it("calculates line item with flat discount", () => {
    const result = calculateLineItem({
      quantity: 2,
      unitPrice: 500,
      discountType: "FLAT",
      discountValue: 50,
      gstRate: 12,
    });
    expect(result.grossAmount).toBe(1000);
    expect(result.discountAmount).toBe(50);
    expect(result.lineTotal).toBe(950);
    expect(result.taxAmount).toBe(114);
  });
});

describe("splitGst", () => {
  it("splits for same state (CGST + SGST)", () => {
    const result = splitGst(180, false);
    expect(result.cgst).toBe(90);
    expect(result.sgst).toBe(90);
    expect(result.igst).toBe(0);
  });

  it("splits for inter state (IGST)", () => {
    const result = splitGst(180, true);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.igst).toBe(180);
  });
});

describe("calculateSummary", () => {
  it("calculates summary with multiple items", () => {
    const items = [
      { quantity: 10, unitPrice: 100, gstRate: 18 },
      { quantity: 5, unitPrice: 200, gstRate: 12 },
    ];
    const result = calculateSummary(items, undefined, undefined, false);
    expect(result.subtotal).toBe(2000);
    expect(result.discountAmount).toBe(0);
    expect(result.taxableAmount).toBe(2000);
    expect(result.cgstTotal).toBe(150);
    expect(result.sgstTotal).toBe(150);
    expect(result.igstTotal).toBe(0);
    expect(result.totalTax).toBe(300);
  });

  it("calculates summary with global discount", () => {
    const items = [{ quantity: 10, unitPrice: 100, gstRate: 18 }];
    const result = calculateSummary(items, "PERCENTAGE", 10, false);
    expect(result.subtotal).toBe(1000);
    expect(result.discountAmount).toBe(100);
    expect(result.taxableAmount).toBe(900);
  });

  it("excludes optional items from subtotal", () => {
    const items = [
      { quantity: 10, unitPrice: 100, gstRate: 18, isOptional: false },
      { quantity: 5, unitPrice: 200, gstRate: 18, isOptional: true },
    ];
    const result = calculateSummary(items, undefined, undefined, false);
    expect(result.subtotal).toBe(1000);
  });
});
