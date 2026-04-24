import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RejectQuoteCommand } from './reject-quote.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(RejectQuoteCommand)
@Injectable()
export class RejectQuoteHandler implements ICommandHandler<RejectQuoteCommand> {
  private readonly logger = new Logger(RejectQuoteHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: RejectQuoteCommand): Promise<{ success: boolean }> {
    try {
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

      if (requirement.authorId !== command.buyerId) {
        throw new ForbiddenException('Only the requirement owner can reject quotes');
      }

      const quote = await this.mktPrisma.client.mktRequirementQuote.findFirst({
        where: { id: command.quoteId, requirementId: command.requirementId },
      });

      if (!quote) {
        throw new NotFoundException(`Quote ${command.quoteId} not found`);
      }

      await this.mktPrisma.client.mktRequirementQuote.update({
        where: { id: command.quoteId },
        data: { status: 'REJECTED' },
      });

      this.logger.log(`Quote ${command.quoteId} rejected for requirement ${command.requirementId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`RejectQuoteHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
