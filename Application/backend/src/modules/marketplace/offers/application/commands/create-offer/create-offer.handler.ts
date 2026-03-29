import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOfferCommand } from './create-offer.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(CreateOfferCommand)
@Injectable()
export class CreateOfferHandler implements ICommandHandler<CreateOfferCommand> {
  private readonly logger = new Logger(CreateOfferHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: CreateOfferCommand): Promise<string> {
    const id = randomUUID();

    const offer = await this.mktPrisma.client.mktOffer.create({
      data: {
        id,
        tenantId: command.tenantId,
        authorId: command.authorId,
        createdById: command.createdById,
        title: command.title,
        description: command.description,
        mediaUrls: command.mediaUrls ?? [],
        offerType: command.offerType as any,
        discountType: command.discountType as any,
        discountValue: command.discountValue,
        linkedListingIds: command.linkedListingIds ?? [],
        linkedCategoryIds: command.linkedCategoryIds ?? [],
        primaryListingId: command.primaryListingId,
        conditions: command.conditions ?? {},
        maxRedemptions: command.maxRedemptions,
        autoCloseOnLimit: command.autoCloseOnLimit !== false,
        resetTime: command.resetTime,
        publishAt: command.publishAt,
        expiresAt: command.expiresAt,
        status: command.publishAt && command.publishAt > new Date() ? 'SCHEDULED' : 'DRAFT',
      },
    });

    this.logger.log(`Offer created: ${offer.id} (${offer.title}) by tenant ${command.tenantId}`);
    return offer.id;
  }
}
