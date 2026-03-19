import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RecordPaymentCommand } from './record-payment.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(RecordPaymentCommand)
export class RecordPaymentHandler implements ICommandHandler<RecordPaymentCommand> {
  private readonly logger = new Logger(RecordPaymentHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RecordPaymentCommand) {
    const invoice = await this.prisma.tenantInvoice.update({
      where: { id: command.invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        gatewayPaymentId: command.gatewayPaymentId,
      },
    });

    this.logger.log(
      `Payment recorded for invoice ${command.invoiceId}, tenant ${command.tenantId}, amount ${command.amount}`,
    );
    return invoice;
  }
}
