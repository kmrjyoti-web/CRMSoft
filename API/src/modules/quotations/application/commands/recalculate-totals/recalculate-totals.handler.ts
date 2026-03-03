import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { RecalculateTotalsCommand } from './recalculate-totals.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';

@CommandHandler(RecalculateTotalsCommand)
export class RecalculateTotalsHandler implements ICommandHandler<RecalculateTotalsCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: QuotationCalculatorService,
  ) {}

  async execute(cmd: RecalculateTotalsCommand) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id: cmd.quotationId },
      include: { lead: { include: { organization: { select: { state: true } } } } },
    });
    if (!quotation) throw new NotFoundException('Quotation not found');

    const customerState = quotation.lead?.organization?.state || undefined;
    const totals = await this.calculator.recalculate(cmd.quotationId, customerState);

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: cmd.quotationId, action: 'RECALCULATED',
        description: `Totals recalculated: ₹${totals.totalAmount}`,
        newValue: String(totals.totalAmount), changedField: 'totalAmount',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return totals;
  }
}
