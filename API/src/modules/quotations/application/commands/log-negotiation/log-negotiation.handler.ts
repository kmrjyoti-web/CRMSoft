import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { LogNegotiationCommand } from './log-negotiation.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(LogNegotiationCommand)
export class LogNegotiationHandler implements ICommandHandler<LogNegotiationCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: LogNegotiationCommand) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id: cmd.quotationId } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    // Move to NEGOTIATION status if not already
    if (['SENT', 'VIEWED'].includes(quotation.status)) {
      await this.prisma.quotation.update({
        where: { id: cmd.quotationId },
        data: { status: 'NEGOTIATION' },
      });
    }

    const log = await this.prisma.quotationNegotiationLog.create({
      data: {
        quotationId: cmd.quotationId,
        negotiationType: cmd.negotiationType as any,
        customerRequirement: cmd.customerRequirement,
        customerBudget: cmd.customerBudget,
        customerPriceExpected: cmd.customerPriceExpected,
        ourPrice: cmd.ourPrice,
        proposedDiscount: cmd.proposedDiscount,
        counterOfferAmount: cmd.counterOfferAmount,
        itemsAdded: cmd.itemsAdded,
        itemsRemoved: cmd.itemsRemoved,
        itemsModified: cmd.itemsModified,
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

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: cmd.quotationId, action: 'NEGOTIATION',
        description: `Negotiation: ${cmd.negotiationType}${cmd.note ? ' — ' + cmd.note : ''}`,
        changedField: 'negotiation',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return log;
  }
}
