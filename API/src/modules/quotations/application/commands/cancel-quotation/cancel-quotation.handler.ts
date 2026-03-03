import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CancelQuotationCommand } from './cancel-quotation.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CancelQuotationCommand)
export class CancelQuotationHandler implements ICommandHandler<CancelQuotationCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelQuotationCommand) {
    const quotation = await this.prisma.quotation.findUnique({ where: { id: cmd.id } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    const terminal = ['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'];
    if (terminal.includes(quotation.status)) {
      throw new BadRequestException(`Cannot cancel quotation with status ${quotation.status}`);
    }

    await this.prisma.quotation.update({
      where: { id: cmd.id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.quotationActivity.create({
      data: {
        quotationId: cmd.id, action: 'CANCELLED',
        description: `Quotation cancelled${cmd.reason ? ': ' + cmd.reason : ''}`,
        previousValue: quotation.status, newValue: 'CANCELLED', changedField: 'status',
        performedById: cmd.userId, performedByName: cmd.userName,
      },
    });

    return { cancelled: true };
  }
}
