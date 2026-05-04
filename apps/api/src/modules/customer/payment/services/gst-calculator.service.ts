import { Injectable } from '@nestjs/common';

export interface GstLineInput {
  quantity: number;
  unitPrice: number;
  discountType?: string;       // 'PERCENTAGE' | 'FLAT'
  discountValue?: number;
  gstRate?: number;            // e.g. 18
  cessRate?: number;           // e.g. 1
}

export interface GstLineResult {
  lineTotal: number;           // qty × unitPrice − discount
  discountAmount: number;
  taxableAmount: number;       // = lineTotal
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  taxAmount: number;           // cgst+sgst+igst+cess
  totalWithTax: number;
}

export interface GstSummary {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  totalTax: number;
  roundOff: number;
  totalAmount: number;
  lines: GstLineResult[];
}

@Injectable()
export class GstCalculatorService {
  /**
   * Calculate GST for a set of line items.
   * @param lines      - line items
   * @param isInterState - true → IGST; false → CGST + SGST
   * @param overallDiscountType  - optional invoice-level discount
   * @param overallDiscountValue - optional invoice-level discount value
   */
  calculate(
    lines: GstLineInput[],
    isInterState: boolean,
    overallDiscountType?: string,
    overallDiscountValue?: number,
  ): GstSummary {
    let subtotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalCess = 0;

    const lineResults: GstLineResult[] = lines.map((line) => {
      const gross = this.round(line.quantity * line.unitPrice);
      let lineDiscount = 0;

      if (line.discountType === 'PERCENTAGE' && line.discountValue) {
        lineDiscount = this.round(gross * line.discountValue / 100);
      } else if (line.discountType === 'FLAT' && line.discountValue) {
        lineDiscount = this.round(line.discountValue);
      }

      const lineTotal = this.round(gross - lineDiscount);
      const taxable = lineTotal;
      const gstRate = line.gstRate || 0;
      const cessRate = line.cessRate || 0;

      let cgst = 0, sgst = 0, igst = 0;
      if (isInterState) {
        igst = this.round(taxable * gstRate / 100);
      } else {
        cgst = this.round(taxable * (gstRate / 2) / 100);
        sgst = this.round(taxable * (gstRate / 2) / 100);
      }

      const cess = this.round(taxable * cessRate / 100);
      const taxAmount = cgst + sgst + igst + cess;

      subtotal += lineTotal;
      totalDiscountAmount += lineDiscount;
      totalCgst += cgst;
      totalSgst += sgst;
      totalIgst += igst;
      totalCess += cess;

      return {
        lineTotal,
        discountAmount: lineDiscount,
        taxableAmount: taxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        cessAmount: cess,
        taxAmount,
        totalWithTax: this.round(taxable + taxAmount),
      };
    });

    // Apply overall discount
    let overallDiscount = 0;
    if (overallDiscountType === 'PERCENTAGE' && overallDiscountValue) {
      overallDiscount = this.round(subtotal * overallDiscountValue / 100);
    } else if (overallDiscountType === 'FLAT' && overallDiscountValue) {
      overallDiscount = this.round(overallDiscountValue);
    }

    totalTaxable = this.round(subtotal - overallDiscount);
    totalDiscountAmount += overallDiscount;

    const totalTax = totalCgst + totalSgst + totalIgst + totalCess;
    const rawTotal = totalTaxable + totalTax;
    const roundOff = this.round(Math.round(rawTotal) - rawTotal);
    const totalAmount = Math.round(rawTotal);

    return {
      subtotal,
      discountAmount: totalDiscountAmount,
      taxableAmount: totalTaxable,
      cgstAmount: totalCgst,
      sgstAmount: totalSgst,
      igstAmount: totalIgst,
      cessAmount: totalCess,
      totalTax,
      roundOff,
      totalAmount,
      lines: lineResults,
    };
  }

  /**
   * Determine if transaction is inter-state based on seller and buyer state codes.
   * First two digits of GSTIN represent state code.
   */
  isInterState(sellerGst: string | null, buyerGst: string | null): boolean {
    if (!sellerGst || !buyerGst) return false;
    return sellerGst.substring(0, 2) !== buyerGst.substring(0, 2);
  }

  /**
   * Determine inter-state status from state names.
   */
  isInterStateByName(sellerState: string | null, buyerState: string | null): boolean {
    if (!sellerState || !buyerState) return false;
    return sellerState.toLowerCase().trim() !== buyerState.toLowerCase().trim();
  }

  private round(val: number): number {
    return Math.round(val * 100) / 100;
  }
}
