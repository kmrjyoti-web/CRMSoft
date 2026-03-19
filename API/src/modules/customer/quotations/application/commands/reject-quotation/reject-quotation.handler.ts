import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RejectQuotationCommand } from './reject-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(RejectQuotationCommand)
export class RejectQuotationHandler implements ICommandHandler<RejectQuotationCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RejectQuotationCommand) {
    const quotation = await this.prisma.working.quotation.findUnique({ where: { id: cmd.id } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    const allowed = ['SENT', 'VIEWED', 'NEGOTIATION'];
    if (!allowed.includes(quotation.status)) {
      throw new BadRequestException(`Cannot reject quotation with status ${quotation.status}`);
    }

    const updated = await this.prisma.working.quotation.update({
      where: { id: cmd.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedReason: cmd.reason,
      },
      include: { lineItems: true, lead: true },
    });

    await this.prisma.working.quotationActivity.create({
      data: {
        quotationId: cmd.id, action: 'REJECTED',
        description: `Quotation rejected${cmd.reason ? ': ' + cmd.reason : ''}`,
        previousValue: quotation.status, newValue: 'REJECTED', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return updated;
  }
}
