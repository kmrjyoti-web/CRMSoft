import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AcceptQuoteCommand } from './accept-quote.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(AcceptQuoteCommand)
@Injectable()
export class AcceptQuoteHandler implements ICommandHandler<AcceptQuoteCommand> {
  private readonly logger = new Logger(AcceptQuoteHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: AcceptQuoteCommand): Promise<{ success: boolean }> {
    try {
      // Verify requirement belongs to buyer
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
        throw new ForbiddenException('Only the requirement owner can accept quotes');
      }

      // Accept the selected quote, reject all others
      await this.mktPrisma.client.$transaction([
        this.mktPrisma.client.mktRequirementQuote.update({
          where: { id: command.quoteId },
          data: { status: 'ACCEPTED' },
        }),
        this.mktPrisma.client.mktRequirementQuote.updateMany({
          where: {
            requirementId: command.requirementId,
            id: { not: command.quoteId },
            status: 'SUBMITTED',
          },
          data: { status: 'REJECTED' },
        }),
      ] as any);

      this.logger.log(`Quote ${command.quoteId} accepted for requirement ${command.requirementId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`AcceptQuoteHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
