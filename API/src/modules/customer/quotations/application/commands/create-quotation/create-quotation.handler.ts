import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CreateQuotationCommand } from './create-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationNumberService } from '../../../services/quotation-number.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';

@CommandHandler(CreateQuotationCommand)
export class CreateQuotationHandler implements ICommandHandler<CreateQuotationCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberService: QuotationNumberService,
    private readonly calculator: QuotationCalculatorService,
  ) {}

  async execute(cmd: CreateQuotationCommand) {
    const lead = await this.prisma.working.lead.findFirst({
      where: { id: cmd.leadId, tenantId: cmd.tenantId },
      include: { organization: { select: { id: true, state: true } } },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const quotationNo = await this.numberService.generateNumber(cmd.tenantId);
    const customerState = lead.organization?.state || undefined;

    // Resolve product details for items with productId
    const lineItemData: any[] = [];
    for (const item of cmd.items || []) {
      let productCode: string | null = null;
      let hsnCode: string | null = null;
      let gstRate = item.gstRate;
      let mrp = item.mrp;

      if (item.productId) {
        const product = await this.prisma.working.product.findFirst({
          where: { id: item.productId, tenantId: cmd.tenantId },
          select: { code: true, hsnCode: true, gstRate: true, mrp: true },
        });
        if (product) {
          productCode = product.code;
          hsnCode = product.hsnCode;
          if (gstRate === undefined && product.gstRate) gstRate = Number(product.gstRate);
          if (mrp === undefined && product.mrp) mrp = Number(product.mrp);
        }
      }

      const calc = this.calculator.calculateLineItem({
        quantity: item.quantity, unitPrice: item.unitPrice,
        discountType: item.discountType, discountValue: item.discountValue,
        gstRate, cessRate: item.cessRate,
      }, this.calculator.isInterState(customerState));

      lineItemData.push({
        tenantId: cmd.tenantId,
        productId: item.productId, productCode, productName: item.productName,
        description: item.description, hsnCode,
        quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice,
        mrp: mrp || null,
        discountType: item.discountType, discountValue: item.discountValue,
        discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
        gstRate: gstRate || null, cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
        cessRate: item.cessRate || null, cessAmount: calc.cessAmount,
        taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
        isOptional: item.isOptional || false, notes: item.notes,
        sortOrder: lineItemData.length,
      });
    }

    const quotation = await this.prisma.working.quotation.create({
      data: {
        tenantId: cmd.tenantId,
        quotationNo, status: 'DRAFT', title: cmd.title, summary: cmd.summary,
        coverNote: cmd.coverNote,
        priceType: (cmd.priceType as any) || 'FIXED',
        minAmount: cmd.minAmount, maxAmount: cmd.maxAmount,
        plusMinusPercent: cmd.plusMinusPercent,
        validFrom: cmd.validFrom, validUntil: cmd.validUntil,
        paymentTerms: cmd.paymentTerms, deliveryTerms: cmd.deliveryTerms,
        warrantyTerms: cmd.warrantyTerms, termsConditions: cmd.termsConditions,
        discountType: cmd.discountType, discountValue: cmd.discountValue || 0,
        leadId: cmd.leadId, contactPersonId: cmd.contactPersonId,
        organizationId: cmd.organizationId,
        tags: cmd.tags || [], internalNotes: cmd.internalNotes,
        createdById: cmd.userId,
        lineItems: { create: lineItemData },
      },
      include: { lineItems: true, lead: true },
    });

    // Recalculate totals
    await this.calculator.recalculate(quotation.id, customerState, cmd.tenantId);

    // Log activity
    await this.prisma.working.quotationActivity.create({
      data: {
        tenantId: cmd.tenantId,
        quotationId: quotation.id, action: 'CREATED',
        description: `Quotation ${quotationNo} created`,
        newValue: 'DRAFT', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return this.prisma.working.quotation.findFirst({
      where: { id: quotation.id, tenantId: cmd.tenantId },
      include: { lineItems: true, lead: true },
    });
  }
}
