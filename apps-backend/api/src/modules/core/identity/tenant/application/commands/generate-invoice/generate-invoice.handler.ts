import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GenerateInvoiceCommand } from './generate-invoice.command';
import { InvoiceGeneratorService } from '../../../services/invoice-generator.service';

@CommandHandler(GenerateInvoiceCommand)
export class GenerateInvoiceHandler implements ICommandHandler<GenerateInvoiceCommand> {
  private readonly logger = new Logger(GenerateInvoiceHandler.name);

  constructor(
    private readonly invoiceGenerator: InvoiceGeneratorService,
  ) {}

  async execute(command: GenerateInvoiceCommand) {
    try {
      const invoice = await this.invoiceGenerator.generate({
        tenantId: command.tenantId,
        subscriptionId: command.subscriptionId,
        periodStart: command.periodStart,
        periodEnd: command.periodEnd,
        amount: command.amount,
        tax: command.tax,
      });

      this.logger.log(
        `Invoice generated: ${invoice.invoiceNumber} for tenant ${command.tenantId}`,
      );
      return invoice;
    } catch (error) {
      this.logger.error(`GenerateInvoiceHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
