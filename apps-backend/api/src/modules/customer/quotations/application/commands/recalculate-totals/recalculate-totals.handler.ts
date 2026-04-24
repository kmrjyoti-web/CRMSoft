import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { RecalculateTotalsCommand } from './recalculate-totals.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';

@CommandHandler(RecalculateTotalsCommand)
export class RecalculateTotalsHandler implements ICommandHandler<RecalculateTotalsCommand> {
    private readonly logger = new Logger(RecalculateTotalsHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: QuotationCalculatorService,
  ) {}

  async execute(cmd: RecalculateTotalsCommand) {
    try {
      const quotation = await this.prisma.working.quotation.findUnique({
        where: { id: cmd.quotationId },
        include: { lead: { include: { organization: { select: { state: true } } } } },
      });
      if (!quotation) throw new NotFoundException('Quotation not found');

      const customerState = quotation.lead?.organization?.state || undefined;
      const totals = await this.calculator.recalculate(cmd.quotationId, customerState);

      await this.prisma.working.quotationActivity.create({
        data: {
          quotationId: cmd.quotationId, action: 'RECALCULATED',
          description: `Totals recalculated: ₹${totals.totalAmount}`,
          newValue: String(totals.totalAmount), changedField: 'totalAmount',
          performedById: cmd.userId, performedByName: cmd.userName,
        },
      });

      return totals;
    } catch (error) {
      this.logger.error(`RecalculateTotalsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
