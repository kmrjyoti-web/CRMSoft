import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ActivateOfferCommand } from './activate-offer.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(ActivateOfferCommand)
@Injectable()
export class ActivateOfferHandler implements ICommandHandler<ActivateOfferCommand> {
  private readonly logger = new Logger(ActivateOfferHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: ActivateOfferCommand): Promise<void> {
    try {
      const offer = await this.mktPrisma.client.mktOffer.findFirst({
        where: { id: command.offerId, tenantId: command.tenantId, isDeleted: false },
      });

      if (!offer) throw new NotFoundException(`Offer ${command.offerId} not found`);

      if (!['DRAFT', 'SCHEDULED', 'PAUSED'].includes(offer.status)) {
        throw new BadRequestException(`Cannot activate offer in status: ${offer.status}`);
      }

      await this.mktPrisma.client.mktOffer.update({
        where: { id: command.offerId },
        data: {
          status: 'ACTIVE',
          publishedAt: offer.publishedAt ?? new Date(),
        },
      });

      this.logger.log(`Offer activated: ${command.offerId}`);
    } catch (error) {
      this.logger.error(`ActivateOfferHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
