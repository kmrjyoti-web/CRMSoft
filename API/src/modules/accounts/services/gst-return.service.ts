import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class GSTReturnService {
  constructor(private readonly prisma: PrismaService) {}

  async generateGSTR1(tenantId: string, period: string) {
    const fy = this.getFYFromPeriod(period);
    const { start, end } = this.getPeriodDates(period);

    // Get all sale invoices for period
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { notIn: ['DRAFT', 'CANCELLED', 'VOID'] },
        invoiceDate: { gte: start, lte: end },
      },
      include: { lineItems: true },
    });

    // B2B: invoices with GSTIN
    const b2b = invoices
      .filter((inv) => inv.billingGstNumber)
      .map((inv) => ({
        invoiceNo: inv.invoiceNo,
        invoiceDate: inv.invoiceDate,
        gstin: inv.billingGstNumber,
        billingName: inv.billingName,
        taxableAmount: Number(inv.taxableAmount),
        cgst: Number(inv.cgstAmount),
        sgst: Number(inv.sgstAmount),
        igst: Number(inv.igstAmount),
        cess: Number(inv.cessAmount),
        total: Number(inv.totalAmount),
        isInterState: inv.isInterState,
      }));

    // B2C Large: > ₹2.5L without GSTIN
    const b2cLarge = invoices
      .filter((inv) => !inv.billingGstNumber && Number(inv.totalAmount) > 250000)
      .map((inv) => ({
        invoiceNo: inv.invoiceNo,
        invoiceDate: inv.invoiceDate,
        billingName: inv.billingName,
        taxableAmount: Number(inv.taxableAmount),
        cgst: Number(inv.cgstAmount),
        sgst: Number(inv.sgstAmount),
        igst: Number(inv.igstAmount),
        total: Number(inv.totalAmount),
      }));

    // B2C Small: rest
    const b2cSmallTotal = invoices
      .filter((inv) => !inv.billingGstNumber && Number(inv.totalAmount) <= 250000)
      .reduce((acc, inv) => ({
        taxableAmount: acc.taxableAmount + Number(inv.taxableAmount),
        cgst: acc.cgst + Number(inv.cgstAmount),
        sgst: acc.sgst + Number(inv.sgstAmount),
        igst: acc.igst + Number(inv.igstAmount),
        total: acc.total + Number(inv.totalAmount),
        count: acc.count + 1,
      }), { taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, total: 0, count: 0 });

    // HSN Summary
    const hsnMap: Record<string, { hsn: string; qty: number; taxable: number; cgst: number; sgst: number; igst: number }> = {};
    for (const inv of invoices) {
      for (const item of inv.lineItems) {
        const hsn = item.hsnCode || 'UNKNOWN';
        if (!hsnMap[hsn]) hsnMap[hsn] = { hsn, qty: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
        hsnMap[hsn].qty += Number(item.quantity);
        hsnMap[hsn].taxable += Number(item.lineTotal);
        hsnMap[hsn].cgst += Number(item.cgstAmount);
        hsnMap[hsn].sgst += Number(item.sgstAmount);
        hsnMap[hsn].igst += Number(item.igstAmount);
      }
    }

    // Totals
    const totalTaxable = invoices.reduce((s, i) => s + Number(i.taxableAmount), 0);
    const totalCgst = invoices.reduce((s, i) => s + Number(i.cgstAmount), 0);
    const totalSgst = invoices.reduce((s, i) => s + Number(i.sgstAmount), 0);
    const totalIgst = invoices.reduce((s, i) => s + Number(i.igstAmount), 0);
    const totalCess = invoices.reduce((s, i) => s + Number(i.cessAmount), 0);

    // Upsert return
    const gstReturn = await this.prisma.gSTReturn.upsert({
      where: { tenantId_returnType_period: { tenantId, returnType: 'GSTR_1', period } },
      create: {
        tenantId,
        returnType: 'GSTR_1',
        period,
        financialYear: fy,
        b2bInvoices: b2b,
        b2cLarge,
        b2cSmall: b2cSmallTotal,
        hsnSummary: Object.values(hsnMap),
        totalTaxableValue: totalTaxable,
        totalCgst: totalCgst,
        totalSgst: totalSgst,
        totalIgst: totalIgst,
        totalCess: totalCess,
        status: 'GENERATED',
      },
      update: {
        b2bInvoices: b2b,
        b2cLarge,
        b2cSmall: b2cSmallTotal,
        hsnSummary: Object.values(hsnMap),
        totalTaxableValue: totalTaxable,
        totalCgst: totalCgst,
        totalSgst: totalSgst,
        totalIgst: totalIgst,
        totalCess: totalCess,
        status: 'GENERATED',
      },
    });

    return gstReturn;
  }

  async generateGSTR3B(tenantId: string, period: string) {
    const fy = this.getFYFromPeriod(period);
    const { start, end } = this.getPeriodDates(period);

    // Output GST (from sales)
    const saleInvoices = await this.prisma.invoice.findMany({
      where: { tenantId, status: { notIn: ['DRAFT', 'CANCELLED', 'VOID'] }, invoiceDate: { gte: start, lte: end } },
    });

    const outputCgst = saleInvoices.reduce((s, i) => s + Number(i.cgstAmount), 0);
    const outputSgst = saleInvoices.reduce((s, i) => s + Number(i.sgstAmount), 0);
    const outputIgst = saleInvoices.reduce((s, i) => s + Number(i.igstAmount), 0);
    const outputCess = saleInvoices.reduce((s, i) => s + Number(i.cessAmount), 0);

    // Input Tax Credit (from purchases)
    const purchaseInvoices = await this.prisma.purchaseInvoice.findMany({
      where: { tenantId, status: { notIn: ['DRAFT', 'CANCELLED'] }, invoiceDate: { gte: start, lte: end } },
    });

    const inputCgst = purchaseInvoices.reduce((s, i) => s + Number(i.cgstAmount ?? 0), 0);
    const inputSgst = purchaseInvoices.reduce((s, i) => s + Number(i.sgstAmount ?? 0), 0);
    const inputIgst = purchaseInvoices.reduce((s, i) => s + Number(i.igstAmount ?? 0), 0);
    const inputCess = purchaseInvoices.reduce((s, i) => s + Number(i.cessAmount ?? 0), 0);

    const totalOutputGst = outputCgst + outputSgst + outputIgst + outputCess;
    const totalInputGst = inputCgst + inputSgst + inputIgst + inputCess;
    const netPayable = Math.round((totalOutputGst - totalInputGst) * 100) / 100;

    const totalTaxable = saleInvoices.reduce((s, i) => s + Number(i.taxableAmount), 0);

    const itc = { cgst: inputCgst, sgst: inputSgst, igst: inputIgst, cess: inputCess, total: totalInputGst };

    const gstReturn = await this.prisma.gSTReturn.upsert({
      where: { tenantId_returnType_period: { tenantId, returnType: 'GSTR_3B', period } },
      create: {
        tenantId,
        returnType: 'GSTR_3B',
        period,
        financialYear: fy,
        totalTaxableValue: totalTaxable,
        totalCgst: outputCgst,
        totalSgst: outputSgst,
        totalIgst: outputIgst,
        totalCess: outputCess,
        inputTaxCredit: itc,
        netTaxPayable: netPayable,
        status: 'GENERATED',
      },
      update: {
        totalTaxableValue: totalTaxable,
        totalCgst: outputCgst,
        totalSgst: outputSgst,
        totalIgst: outputIgst,
        totalCess: outputCess,
        inputTaxCredit: itc,
        netTaxPayable: netPayable,
        status: 'GENERATED',
      },
    });

    return gstReturn;
  }

  async getInputTaxCredit(tenantId: string, period: string) {
    const { start, end } = this.getPeriodDates(period);
    const purchases = await this.prisma.purchaseInvoice.findMany({
      where: { tenantId, status: { notIn: ['DRAFT', 'CANCELLED'] }, invoiceDate: { gte: start, lte: end } },
    });

    return {
      cgst: purchases.reduce((s, i) => s + Number(i.cgstAmount ?? 0), 0),
      sgst: purchases.reduce((s, i) => s + Number(i.sgstAmount ?? 0), 0),
      igst: purchases.reduce((s, i) => s + Number(i.igstAmount ?? 0), 0),
      cess: purchases.reduce((s, i) => s + Number(i.cessAmount ?? 0), 0),
      total: purchases.reduce((s, i) => s + Number(i.cgstAmount ?? 0) + Number(i.sgstAmount ?? 0) + Number(i.igstAmount ?? 0) + Number(i.cessAmount ?? 0), 0),
      invoiceCount: purchases.length,
    };
  }

  async findAll(tenantId: string) {
    return this.prisma.gSTReturn.findMany({ where: { tenantId }, orderBy: { period: 'desc' } });
  }

  async findById(tenantId: string, id: string) {
    const ret = await this.prisma.gSTReturn.findFirst({ where: { id, tenantId } });
    if (!ret) throw new NotFoundException('GST Return not found');
    return ret;
  }

  async markFiled(tenantId: string, id: string, userId: string, acknowledgementNo?: string) {
    return this.prisma.gSTReturn.update({
      where: { id },
      data: { status: 'FILED', filedAt: new Date(), filedById: userId, acknowledgementNo },
    });
  }

  private getPeriodDates(period: string): { start: Date; end: Date } {
    const [year, month] = period.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return { start, end };
  }

  private getFYFromPeriod(period: string): string {
    const [year, month] = period.split('-').map(Number);
    const fyStart = month >= 4 ? year : year - 1;
    return `${fyStart}-${(fyStart + 1).toString().slice(2)}`;
  }
}
