import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CreateFromTemplateCommand } from './create-from-template.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { QuotationNumberService } from '../../../services/quotation-number.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';

@CommandHandler(CreateFromTemplateCommand)
export class CreateFromTemplateHandler implements ICommandHandler<CreateFromTemplateCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberService: QuotationNumberService,
    private readonly calculator: QuotationCalculatorService,
  ) {}

  async execute(cmd: CreateFromTemplateCommand) {
    const template = await this.prisma.quotationTemplate.findUnique({
      where: { id: cmd.templateId },
    });
    if (!template) throw new NotFoundException('Template not found');

    const lead = await this.prisma.lead.findUnique({
      where: { id: cmd.leadId },
      include: { organization: { select: { state: true } } },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const quotationNo = await this.numberService.generateNumber();
    const customerState = lead.organization?.state || undefined;
    const interState = this.calculator.isInterState(customerState);

    // Resolve template items
    const lineItemData: any[] = [];
    const defaultItems = (template.defaultItems as any[]) || [];
    for (const item of defaultItems) {
      let productName = item.productName || 'Item';
      let productCode: string | null = null;
      let hsnCode: string | null = null;
      let gstRate = item.gstRate;
      let unitPrice = item.unitPrice || 0;

      if (item.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, code: true, hsnCode: true, gstRate: true, salePrice: true },
        });
        if (product) {
          productName = product.name;
          productCode = product.code;
          hsnCode = product.hsnCode;
          if (gstRate === undefined && product.gstRate) gstRate = Number(product.gstRate);
          if (!unitPrice && product.salePrice) unitPrice = Number(product.salePrice);
        }
      }

      const calc = this.calculator.calculateLineItem({
        quantity: item.quantity || 1, unitPrice,
        discountType: item.discountType, discountValue: item.discountValue, gstRate,
      }, interState);

      lineItemData.push({
        productId: item.productId, productCode, productName,
        hsnCode, quantity: item.quantity || 1, unitPrice,
        discountType: item.discountType, discountValue: item.discountValue,
        discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
        gstRate: gstRate || null,
        cgstAmount: calc.cgstAmount, sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
        taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
        sortOrder: lineItemData.length,
      });
    }

    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNo, status: 'DRAFT',
        coverNote: template.coverNote,
        paymentTerms: template.defaultPayment,
        deliveryTerms: template.defaultDelivery,
        warrantyTerms: template.defaultWarranty,
        termsConditions: template.defaultTerms,
        leadId: cmd.leadId, createdById: cmd.userId,
        lineItems: { create: lineItemData },
      },
      include: { lineItems: true, lead: true },
    });

    await this.calculator.recalculate(quotation.id, customerState);

    // Increment template usage
    await this.prisma.quotationTemplate.update({
      where: { id: cmd.templateId },
      data: { usageCount: { increment: 1 } },
    });

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: quotation.id, action: 'CREATED',
        description: `Created from template "${template.name}"`,
        newValue: 'DRAFT', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return this.prisma.quotation.findUnique({
      where: { id: quotation.id },
      include: { lineItems: true, lead: true },
    });
  }
}
