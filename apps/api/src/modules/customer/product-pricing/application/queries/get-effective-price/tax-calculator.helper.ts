import { Decimal } from '@prisma/client/runtime/library';

export interface TaxBreakup {
  taxType: string;
  gstRate: number;
  cgst: { rate: number; amount: number } | null;
  sgst: { rate: number; amount: number } | null;
  igst: { rate: number; amount: number } | null;
  cess: { rate: number; amount: number };
  totalTax: number;
}

export interface TaxInput {
  basePrice: number;
  gstRate: number;
  cessRate: number;
  taxType: string;
  taxInclusive: boolean;
  isInterState: boolean;
  quantity: number;
}

export function toNum(val: any): number {
  if (val instanceof Decimal) return val.toNumber();
  return Number(val) || 0;
}

export function round(val: number): number {
  return Math.round(val * 100) / 100;
}

export function calculateTax(input: TaxInput) {
  const {
    basePrice, gstRate, cessRate,
    taxType, taxInclusive, isInterState, quantity,
  } = input;

  const isExempt = taxType === 'EXEMPT' || taxType === 'ZERO_RATED';

  let baseAmount: number;
  let gstAmount: number;

  if (isExempt) {
    baseAmount = basePrice;
    gstAmount = 0;
  } else if (taxInclusive) {
    baseAmount = basePrice / (1 + gstRate / 100);
    gstAmount = basePrice - baseAmount;
  } else {
    baseAmount = basePrice;
    gstAmount = baseAmount * (gstRate / 100);
  }

  const cessAmount = isExempt ? 0 : baseAmount * (cessRate / 100);
  const totalTax = gstAmount + cessAmount;
  const unitTotal = taxInclusive ? basePrice : baseAmount + totalTax;

  const tax = buildTaxBreakup(
    taxType, gstRate, gstAmount, cessRate,
    cessAmount, totalTax, isInterState, quantity,
  );

  return { baseAmount, totalTax, unitTotal, tax };
}

function buildTaxBreakup(
  taxType: string, gstRate: number, gstAmount: number,
  cessRate: number, cessAmount: number, totalTax: number,
  isInterState: boolean, quantity: number,
): TaxBreakup {
  const isExempt = taxType === 'EXEMPT' || taxType === 'ZERO_RATED';

  if (isExempt) {
    return {
      taxType, gstRate: 0,
      cgst: null, sgst: null, igst: null,
      cess: { rate: 0, amount: 0 },
      totalTax: 0,
    };
  }

  const cgst = !isInterState
    ? { rate: round(gstRate / 2), amount: round((gstAmount / 2) * quantity) }
    : null;
  const sgst = !isInterState
    ? { rate: round(gstRate / 2), amount: round((gstAmount / 2) * quantity) }
    : null;
  const igst = isInterState
    ? { rate: round(gstRate), amount: round(gstAmount * quantity) }
    : null;

  return {
    taxType, gstRate, cgst, sgst, igst,
    cess: { rate: cessRate, amount: round(cessAmount * quantity) },
    totalTax: round(totalTax * quantity),
  };
}
