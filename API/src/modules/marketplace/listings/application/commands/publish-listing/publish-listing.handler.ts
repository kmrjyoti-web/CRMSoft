import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PublishListingCommand } from './publish-listing.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(PublishListingCommand)
@Injectable()
export class PublishListingHandler implements ICommandHandler<PublishListingCommand> {
  private readonly logger = new Logger(PublishListingHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: PublishListingCommand): Promise<void> {
    const listing = await this.mktPrisma.client.mktListing.findFirst({
      where: { id: command.id, tenantId: command.tenantId, isDeleted: false },
    });

    if (!listing) {
      throw new NotFoundException(`Listing ${command.id} not found`);
    }

    if (listing.status !== 'DRAFT' && listing.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `Cannot publish listing in status: ${listing.status}`,
      );
    }

    await this.mktPrisma.client.mktListing.update({
      where: { id: command.id },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date(),
        updatedById: command.publishedById,
      },
    });

    this.logger.log(`Listing published: ${command.id}`);
  }
}
