import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateReviewCommand } from './create-review.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(CreateReviewCommand)
@Injectable()
export class CreateReviewHandler implements ICommandHandler<CreateReviewCommand> {
  private readonly logger = new Logger(CreateReviewHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: CreateReviewCommand) {
    if (command.rating < 1 || command.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Verify listing exists
    const listing = await this.mktPrisma.client.mktListing.findFirst({
      where: { id: command.listingId, tenantId: command.tenantId, isDeleted: false },
    });
    if (!listing) {
      throw new NotFoundException(`Listing ${command.listingId} not found`);
    }

    // Determine if verified purchase (orderId provided)
    const isVerifiedPurchase = Boolean(command.orderId);

    // Auto-approve verified purchases; PENDING otherwise
    const status = isVerifiedPurchase ? 'APPROVED' : 'PENDING';

    const id = randomUUID();
    const review = await this.mktPrisma.client.mktReview.create({
      data: {
        id,
        tenantId: command.tenantId,
        listingId: command.listingId,
        reviewerId: command.reviewerId,
        rating: command.rating,
        title: command.title,
        body: command.body,
        mediaUrls: command.mediaUrls ?? [],
        isVerifiedPurchase,
        orderId: command.orderId,
        status: status as any,
      },
    });

    // If auto-approved, update listing rating and review count
    if (status === 'APPROVED') {
      await this.updateListingRating(command.listingId, command.tenantId);
    }

    this.logger.log(`Review ${id} created for listing ${command.listingId}, status: ${status}`);
    return review;
  }

  private async updateListingRating(listingId: string, tenantId: string): Promise<void> {
    const reviews = await this.mktPrisma.client.mktReview.findMany({
      where: { listingId, tenantId, status: 'APPROVED', isDeleted: false },
      select: { rating: true },
    });

    const count = reviews.length;
    const avgRating = count > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : null;

    await this.mktPrisma.client.mktListing.update({
      where: { id: listingId },
      data: {
        reviewCount: count,
        avgRating,
      },
    });
  }
}
