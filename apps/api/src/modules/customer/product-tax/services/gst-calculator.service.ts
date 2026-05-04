import { Injectable } from '@nestjs/common';
import { GSTBreakup, TaxComponent } from '../presentation/dto/product-tax.dto';

@Injectable()
export class ProductTaxGstCalculatorService {
  calculateGST(params: {
    amount: number;
    gstRate: number;
    cessRate?: number;
    isInterState: boolean;
    taxInclusive: boolean;
  }): GSTBreakup {
    const { amount, gstRate, isInterState, taxInclusive } = params;
    const cessRate = params.cessRate || 0;
    const totalRate = gstRate + cessRate;

    const baseAmount = taxInclusive
      ? this.round(amount / (1 + totalRate / 100))
      : amount;

    let cgst: TaxComponent | null = null;
    let sgst: TaxComponent | null = null;
    let igst: TaxComponent | null = null;

    if (isInterState) {
      igst = {
        rate: gstRate,
        amount: this.round(baseAmount * gstRate / 100),
      };
    } else {
      cgst = {
        rate: gstRate / 2,
        amount: this.round(baseAmount * gstRate / 200),
      };
      sgst = {
        rate: gstRate / 2,
        amount: this.round(baseAmount * gstRate / 200),
      };
    }

    const cess: TaxComponent = {
      rate: cessRate,
      amount: this.round(baseAmount * cessRate / 100),
    };

    const totalTax =
      (cgst?.amount || 0) +
      (sgst?.amount || 0) +
      (igst?.amount || 0) +
      cess.amount;

    const grandTotal = this.round(baseAmount + totalTax);

    return {
      baseAmount: this.round(baseAmount),
      gstRate,
      isInterState,
      cgst,
      sgst,
      igst,
      cess,
      totalTax: this.round(totalTax),
      grandTotal,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
