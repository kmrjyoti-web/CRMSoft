import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CancelQuotationCommand } from './cancel-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CancelQuotationCommand)
export class CancelQuotationHandler implements ICommandHandler<CancelQuotationCommand> {
    private readonly logger = new Logger(CancelQuotationHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelQuotationCommand) {
    try {
      const quotation = await this.prisma.working.quotation.findUnique({ where: { id: cmd.id } });
      if (!quotation) throw new NotFoundException('Quotation not found');

      const terminal = ['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'];
      if (terminal.includes(quotation.status)) {
        throw new BadRequestException(`Cannot cancel quotation with status ${quotation.status}`);
      }

      await this.prisma.working.quotation.update({
        where: { id: cmd.id },
        data: { status: 'CANCELLED' },
      });

      await this.prisma.working.quotationActivity.create({
        data: {
          quotationId: cmd.id, action: 'CANCELLED',
          description: `Quotation cancelled${cmd.reason ? ': ' + cmd.reason : ''}`,
          previousValue: quotation.status, newValue: 'CANCELLED', changedField: 'status',
          performedById: cmd.userId, performedByName: cmd.userName,
        },
      });

      return { cancelled: true };
    } catch (error) {
      this.logger.error(`CancelQuotationHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
