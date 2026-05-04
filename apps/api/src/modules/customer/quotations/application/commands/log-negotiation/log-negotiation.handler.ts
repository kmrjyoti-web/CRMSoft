import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { LogNegotiationCommand } from './log-negotiation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(LogNegotiationCommand)
export class LogNegotiationHandler implements ICommandHandler<LogNegotiationCommand> {
    private readonly logger = new Logger(LogNegotiationHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: LogNegotiationCommand) {
    try {
      const quotation = await this.prisma.working.quotation.findUnique({ where: { id: cmd.quotationId } });
      if (!quotation) throw new NotFoundException('Quotation not found');

      // Move to NEGOTIATION status if not already
      if (['SENT', 'VIEWED'].includes(quotation.status)) {
        await this.prisma.working.quotation.update({
          where: { id: cmd.quotationId },
          data: { status: 'NEGOTIATION' },
        });
      }

      const log = await this.prisma.working.quotationNegotiationLog.create({
        data: {
          quotationId: cmd.quotationId,
          negotiationType: cmd.negotiationType as any,
          customerRequirement: cmd.customerRequirement,
          customerBudget: cmd.customerBudget,
          customerPriceExpected: cmd.customerPriceExpected,
          ourPrice: cmd.ourPrice,
          proposedDiscount: cmd.proposedDiscount,
          counterOfferAmount: cmd.counterOfferAmount,
          itemsAdded: cmd.itemsAdded as any,
          itemsRemoved: cmd.itemsRemoved as any,
          itemsModified: cmd.itemsModified as any,
          termsChanged: cmd.termsChanged,
          note: cmd.note,
          outcome: cmd.outcome,
          loggedById: cmd.userId,
          loggedByName: cmd.userName,
          contactPersonId: cmd.contactPersonId,
          contactPersonName: cmd.contactPersonName,
          loggedAt: new Date(),
        },
      });

      await this.prisma.working.quotationActivity.create({
        data: {
          quotationId: cmd.quotationId, action: 'NEGOTIATION',
          description: `Negotiation: ${cmd.negotiationType}${cmd.note ? ' — ' + cmd.note : ''}`,
          changedField: 'negotiation',
          performedById: cmd.userId, performedByName: cmd.userName,
        },
      });

      return log;
    } catch (error) {
      this.logger.error(`LogNegotiationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
