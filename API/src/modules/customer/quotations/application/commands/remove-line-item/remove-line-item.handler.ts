import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RemoveLineItemCommand } from './remove-line-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';

@CommandHandler(RemoveLineItemCommand)
export class RemoveLineItemHandler implements ICommandHandler<RemoveLineItemCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: QuotationCalculatorService,
  ) {}

  async execute(cmd: RemoveLineItemCommand) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: cmd.quotationId },
      include: { lead: { include: { organization: { select: { state: true } } } } },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
      throw new BadRequestException('Cannot remove items from non-draft quotation');
    }

    const item = await this.prisma.quotationLineItem.findUnique({ where: { id: cmd.itemId } });
    if (!item || item.quotationId !== cmd.quotationId) {
      throw new NotFoundException('Line item not found');
    }

    await this.prisma.quotationLineItem.delete({ where: { id: cmd.itemId } });

    const customerState = quotation.lead?.organization?.state || undefined;
    await this.calculator.recalculate(cmd.quotationId, customerState);

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: cmd.quotationId, action: 'ITEM_REMOVED',
        description: `Item "${item.productName}" removed`,
        previousValue: item.productName, changedField: 'lineItems',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return { removed: true };
  }
}
