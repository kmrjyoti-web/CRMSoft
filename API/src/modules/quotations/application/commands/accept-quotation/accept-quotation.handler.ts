import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AcceptQuotationCommand } from './accept-quotation.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(AcceptQuotationCommand)
export class AcceptQuotationHandler implements ICommandHandler<AcceptQuotationCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: AcceptQuotationCommand) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id: cmd.id } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    const allowed = ['SENT', 'VIEWED', 'NEGOTIATION'];
    if (!allowed.includes(quotation.status)) {
      throw new BadRequestException(`Cannot accept quotation with status ${quotation.status}`);
    }

    const updated = await this.prisma.quotation.update({
      where: { id: cmd.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        acceptedNote: cmd.note,
      },
      include: { lineItems: true, lead: true },
    });

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: cmd.id, action: 'ACCEPTED',
        description: `Quotation accepted${cmd.note ? ': ' + cmd.note : ''}`,
        previousValue: quotation.status, newValue: 'ACCEPTED', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return updated;
  }
}
