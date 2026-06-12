/**
 * GST calculation utilities for quotation line items and summary.
 * Pure functions — used for client-side live preview; server recalculates on save.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LineItemCalcInput {
  quantity: number;
  unitPrice: number;
  discountType?: string;
  discountValue?: number | null;
  gstRate?: number | null;
  cessRate?: number | null;
  isOptional?: boolean;
}

export interface LineItemCalcResult {
  grossAmount: number;
  discountAmount: number;
  lineTotal: number;
  taxAmount: number;
  cessAmount: number;
  totalWithTax: number;
}

export interface GstSplit {
  cgst: number;
  sgst: number;
  igst: number;
}

export interface SummaryResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  cessTotal: number;
  totalTax: number;
  roundOff: number;
  totalAmount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Line item calculation
// ---------------------------------------------------------------------------

export function calculateLineItem(item: LineItemCalcInput): LineItemCalcResult {
  const grossAmount = round2((item.quantity ?? 0) * (item.unitPrice ?? 0));

  let discountAmount = 0;
  if (item.discountValue && item.discountValue > 0) {
    discountAmount =
      item.discountType === "PERCENTAGE"
        ? round2(grossAmount * item.discountValue / 100)
        : round2(item.discountValue);
  }

  const lineTotal = round2(grossAmount - discountAmount);
  const taxAmount = round2(lineTotal * (item.gstRate ?? 0) / 100);
  const cessAmount = round2(lineTotal * (item.cessRate ?? 0) / 100);
  const totalWithTax = round2(lineTotal + taxAmount + cessAmount);

  return { grossAmount, discountAmount, lineTotal, taxAmount, cessAmount, totalWithTax };
}

// ---------------------------------------------------------------------------
// GST split: same state → CGST + SGST, inter-state → IGST
// ---------------------------------------------------------------------------

export function splitGst(taxAmount: number, isInterState: boolean): GstSplit {
  if (isInterState) {
    return { cgst: 0, sgst: 0, igst: round2(taxAmount) };
  }
  const half = round2(taxAmount / 2);
  return { cgst: half, sgst: half, igst: 0 };
}

// ---------------------------------------------------------------------------
// Summary across all line items
// ---------------------------------------------------------------------------

export function calculateSummary(
  lineItems: LineItemCalcInput[],
  globalDiscountType?: string,
  globalDiscountValue?: number | null,
  isInterState: boolean = false,
): SummaryResult {
  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let cessTotal = 0;

  for (const item of lineItems) {
    const calc = calculateLineItem(item);

    // Optional items excluded from subtotal
    if (!item.isOptional) {
      subtotal = round2(subtotal + calc.lineTotal);
    }

    const gst = splitGst(calc.taxAmount, isInterState);
    cgstTotal = round2(cgstTotal + gst.cgst);
    sgstTotal = round2(sgstTotal + gst.sgst);
    igstTotal = round2(igstTotal + gst.igst);
    cessTotal = round2(cessTotal + calc.cessAmount);
  }

  // Global discount
  let discountAmount = 0;
  if (globalDiscountValue && globalDiscountValue > 0) {
    discountAmount =
      globalDiscountType === "PERCENTAGE"
        ? round2(subtotal * globalDiscountValue / 100)
        : round2(globalDiscountValue);
  }

  const taxableAmount = round2(subtotal - discountAmount);
  const totalTax = round2(cgstTotal + sgstTotal + igstTotal + cessTotal);

  const rawTotal = taxableAmount + totalTax;
  const roundedTotal = Math.round(rawTotal);
  const roundOff = round2(roundedTotal - rawTotal);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    cgstTotal,
    sgstTotal,
    igstTotal,
    cessTotal,
    totalTax,
    roundOff,
    totalAmount: roundedTotal,
  };
}
