import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SubmitQuoteCommand } from './submit-quote.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(SubmitQuoteCommand)
@Injectable()
export class SubmitQuoteHandler implements ICommandHandler<SubmitQuoteCommand> {
  private readonly logger = new Logger(SubmitQuoteHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: SubmitQuoteCommand): Promise<string> {
    try {
      // Verify requirement exists
      const requirement = await this.mktPrisma.client.mktListing.findFirst({
        where: {
          id: command.requirementId,
          tenantId: command.tenantId,
          listingType: 'REQUIREMENT',
          isDeleted: false,
        },
      });

      if (!requirement) {
        throw new NotFoundException(`Requirement ${command.requirementId} not found`);
      }

      const id = randomUUID();

      const quote = await this.mktPrisma.client.mktRequirementQuote.create({
        data: {
          id,
          requirementId: command.requirementId,
          sellerId: command.sellerId,
          tenantId: command.tenantId,
          pricePerUnit: command.pricePerUnit,
          quantity: command.quantity,
          deliveryDays: command.deliveryDays,
          creditDays: command.creditDays,
          notes: command.notes,
          certifications: command.certifications ?? [],
          status: 'SUBMITTED',
        },
      });

      this.logger.log(`Quote ${quote.id} submitted by seller ${command.sellerId} for requirement ${command.requirementId}`);
      return quote.id;
    } catch (error) {
      this.logger.error(`SubmitQuoteHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
