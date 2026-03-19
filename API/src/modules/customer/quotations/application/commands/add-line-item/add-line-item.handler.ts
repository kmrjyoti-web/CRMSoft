import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AddLineItemCommand } from './add-line-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';

@CommandHandler(AddLineItemCommand)
export class AddLineItemHandler implements ICommandHandler<AddLineItemCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: QuotationCalculatorService,
  ) {}

  async execute(cmd: AddLineItemCommand) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: cmd.quotationId },
      include: {
        lineItems: { select: { id: true } },
        lead: { include: { organization: { select: { state: true } } } },
      },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
      throw new BadRequestException('Cannot add items to non-draft quotation');
    }

    let productCode: string | null = null;
    let hsnCode: string | null = null;
    let productName = cmd.productName || 'Custom Item';
    let gstRate = cmd.gstRate;
    let mrp = cmd.mrp;

    if (cmd.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: cmd.productId },
        select: { name: true, code: true, hsnCode: true, gstRate: true, mrp: true, salePrice: true },
      });
      if (product) {
        productName = product.name;
        productCode = product.code;
        hsnCode = product.hsnCode;
        if (gstRate === undefined && product.gstRate) gstRate = Number(product.gstRate);
        if (mrp === undefined && product.mrp) mrp = Number(product.mrp);
      }
    }

    const customerState = quotation.lead?.organization?.state || undefined;
    const interState = this.calculator.isInterState(customerState);
    const calc = this.calculator.calculateLineItem({
      quantity: cmd.quantity || 1, unitPrice: cmd.unitPrice || 0,
      discountType: cmd.discountType, discountValue: cmd.discountValue,
      gstRate, cessRate: cmd.cessRate,
    }, interState);

    const item = await this.prisma.quotationLineItem.create({
      data: {
        quotationId: cmd.quotationId,
        productId: cmd.productId, productCode, productName,
        description: cmd.description, hsnCode,
        quantity: cmd.quantity || 1, unit: cmd.unit,
        unitPrice: cmd.unitPrice || 0, mrp: mrp || null,
        discountType: cmd.discountType, discountValue: cmd.discountValue,
        discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
        gstRate: gstRate || null,
        cgstAmount: calc.cgstAmount, sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
        cessRate: cmd.cessRate || null, cessAmount: calc.cessAmount,
        taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
        isOptional: cmd.isOptional || false, notes: cmd.notes,
        sortOrder: quotation.lineItems.length,
      },
    });

    await this.calculator.recalculate(cmd.quotationId, customerState);

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: cmd.quotationId, action: 'ITEM_ADDED',
        description: `Item "${productName}" added`,
        newValue: productName, changedField: 'lineItems',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return item;
  }
}
