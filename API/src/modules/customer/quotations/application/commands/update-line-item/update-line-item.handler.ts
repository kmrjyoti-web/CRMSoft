import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateLineItemCommand } from './update-line-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';

@CommandHandler(UpdateLineItemCommand)
export class UpdateLineItemHandler implements ICommandHandler<UpdateLineItemCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: QuotationCalculatorService,
  ) {}

  async execute(cmd: UpdateLineItemCommand) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: cmd.quotationId },
      include: { lead: { include: { organization: { select: { state: true } } } } },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
      throw new BadRequestException('Cannot update items on non-draft quotation');
    }

    const item = await this.prisma.quotationLineItem.findUnique({ where: { id: cmd.itemId } });
    if (!item || item.quotationId !== cmd.quotationId) {
      throw new NotFoundException('Line item not found');
    }

    const data: any = {};
    if (cmd.productName !== undefined) data.productName = cmd.productName;
    if (cmd.description !== undefined) data.description = cmd.description;
    if (cmd.quantity !== undefined) data.quantity = cmd.quantity;
    if (cmd.unit !== undefined) data.unit = cmd.unit;
    if (cmd.unitPrice !== undefined) data.unitPrice = cmd.unitPrice;
    if (cmd.discountType !== undefined) data.discountType = cmd.discountType;
    if (cmd.discountValue !== undefined) data.discountValue = cmd.discountValue;
    if (cmd.gstRate !== undefined) data.gstRate = cmd.gstRate;
    if (cmd.cessRate !== undefined) data.cessRate = cmd.cessRate;
    if (cmd.isOptional !== undefined) data.isOptional = cmd.isOptional;
    if (cmd.notes !== undefined) data.notes = cmd.notes;

    // Recalculate line item
    const customerState = quotation.lead?.organization?.state || undefined;
    const calc = this.calculator.calculateLineItem({
      quantity: cmd.quantity ?? Number(item.quantity),
      unitPrice: cmd.unitPrice ?? Number(item.unitPrice),
      discountType: cmd.discountType ?? item.discountType ?? undefined,
      discountValue: cmd.discountValue ?? (item.discountValue ? Number(item.discountValue) : undefined),
      gstRate: cmd.gstRate ?? (item.gstRate ? Number(item.gstRate) : undefined),
      cessRate: cmd.cessRate ?? (item.cessRate ? Number(item.cessRate) : undefined),
    }, this.calculator.isInterState(customerState));

    Object.assign(data, {
      discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
      cgstAmount: calc.cgstAmount, sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
      cessAmount: calc.cessAmount, taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
    });

    const updated = await this.prisma.quotationLineItem.update({
      where: { id: cmd.itemId }, data,
    });

    await this.calculator.recalculate(cmd.quotationId, customerState);

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: cmd.quotationId, action: 'ITEM_UPDATED',
        description: `Item "${updated.productName}" updated`,
        changedField: 'lineItems',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return updated;
  }
}
