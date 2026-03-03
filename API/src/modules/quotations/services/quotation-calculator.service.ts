import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from '@prisma/client/runtime/library';

export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  discountType?: string;
  discountValue?: number;
  gstRate?: number;
  cessRate?: number;
  isOptional?: boolean;
}

export interface CalculatedLineItem {
  discountAmount: number;
  lineTotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  taxAmount: number;
  totalWithTax: number;
}

export interface QuotationTotals {
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
}

@Injectable()
export class QuotationCalculatorService {
  private companyState: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.companyState = this.config.get<string>('COMPANY_STATE', 'Maharashtra');
  }

  /** Determine if inter-state transaction. */
  isInterState(customerState?: string): boolean {
    if (!customerState) return false;
    return customerState.toLowerCase() !== this.companyState.toLowerCase();
  }

  /** Calculate a single line item's tax breakdown. */
  calculateLineItem(item: LineItemInput, interState: boolean): CalculatedLineItem {
    const qty = item.quantity;
    const price = item.unitPrice;
    const gross = qty * price;

    let discountAmount = 0;
    if (item.discountType === 'PERCENTAGE' && item.discountValue) {
      discountAmount = gross * item.discountValue / 100;
    } else if (item.discountType === 'FLAT' && item.discountValue) {
      discountAmount = item.discountValue;
    }

    const lineTotal = Math.round((gross - discountAmount) * 100) / 100;
    const gstRate = item.gstRate || 0;
    const taxAmount = Math.round(lineTotal * gstRate / 100 * 100) / 100;

    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
    if (interState) {
      igstAmount = taxAmount;
    } else {
      cgstAmount = Math.round(taxAmount / 2 * 100) / 100;
      sgstAmount = Math.round((taxAmount - cgstAmount) * 100) / 100;
    }

    const cessRate = item.cessRate || 0;
    const cessAmount = Math.round(lineTotal * cessRate / 100 * 100) / 100;
    const totalWithTax = Math.round((lineTotal + taxAmount + cessAmount) * 100) / 100;

    return { discountAmount, lineTotal, cgstAmount, sgstAmount, igstAmount, cessAmount, taxAmount, totalWithTax };
  }

  /**
   * Recalculate all totals for a quotation.
   * Called after ANY item add/update/remove.
   */
  async recalculate(quotationId: string, customerState?: string): Promise<QuotationTotals> {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { lineItems: true },
    });
    if (!quotation) throw new Error('Quotation not found');

    const interState = this.isInterState(customerState);

    let subtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, totalCess = 0;

    for (const item of quotation.lineItems) {
      const calc = this.calculateLineItem({
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountType: item.discountType || undefined,
        discountValue: item.discountValue ? Number(item.discountValue) : undefined,
        gstRate: item.gstRate ? Number(item.gstRate) : undefined,
        cessRate: item.cessRate ? Number(item.cessRate) : undefined,
        isOptional: item.isOptional,
      }, interState);

      await this.prisma.quotationLineItem.update({
        where: { id: item.id },
        data: {
          discountAmount: calc.discountAmount,
          lineTotal: calc.lineTotal,
          cgstAmount: calc.cgstAmount,
          sgstAmount: calc.sgstAmount,
          igstAmount: calc.igstAmount,
          cessAmount: calc.cessAmount,
          taxAmount: calc.taxAmount,
          totalWithTax: calc.totalWithTax,
        },
      });

      if (!item.isOptional) {
        subtotal += calc.lineTotal;
        totalCgst += calc.cgstAmount;
        totalSgst += calc.sgstAmount;
        totalIgst += calc.igstAmount;
        totalCess += calc.cessAmount;
      }
    }

    // Global discount
    let globalDiscount = 0;
    if (quotation.discountType === 'PERCENTAGE') {
      globalDiscount = subtotal * Number(quotation.discountValue) / 100;
    } else if (quotation.discountType === 'FLAT') {
      globalDiscount = Number(quotation.discountValue);
    }
    globalDiscount = Math.round(globalDiscount * 100) / 100;

    const taxableAmount = Math.round((subtotal - globalDiscount) * 100) / 100;
    const totalTax = Math.round((totalCgst + totalSgst + totalIgst + totalCess) * 100) / 100;
    const rawTotal = taxableAmount + totalTax;
    const roundOff = Math.round(rawTotal) - rawTotal;
    const totalAmount = Math.round(rawTotal + roundOff);

    const totals: QuotationTotals = {
      subtotal, discountAmount: globalDiscount, taxableAmount,
      cgstAmount: totalCgst, sgstAmount: totalSgst, igstAmount: totalIgst,
      cessAmount: totalCess, totalTax,
      roundOff: Math.round(roundOff * 100) / 100, totalAmount,
    };

    await this.prisma.quotation.update({
      where: { id: quotationId },
      data: {
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        cgstAmount: totals.cgstAmount,
        sgstAmount: totals.sgstAmount,
        igstAmount: totals.igstAmount,
        cessAmount: totals.cessAmount,
        totalTax: totals.totalTax,
        roundOff: totals.roundOff,
        totalAmount: totals.totalAmount,
      },
    });

    return totals;
  }
}
