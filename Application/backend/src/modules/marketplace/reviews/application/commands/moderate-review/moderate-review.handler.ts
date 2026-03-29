import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ModerateReviewCommand } from './moderate-review.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(ModerateReviewCommand)
@Injectable()
export class ModerateReviewHandler implements ICommandHandler<ModerateReviewCommand> {
  private readonly logger = new Logger(ModerateReviewHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: ModerateReviewCommand): Promise<void> {
    const review = await this.mktPrisma.client.mktReview.findFirst({
      where: { id: command.reviewId, tenantId: command.tenantId, isDeleted: false },
    });

    if (!review) throw new NotFoundException(`Review ${command.reviewId} not found`);

    const statusMap = { APPROVE: 'APPROVED', REJECT: 'REJECTED', FLAG: 'FLAGGED' } as const;
    const newStatus = statusMap[command.action];

    await this.mktPrisma.client.mktReview.update({
      where: { id: command.reviewId },
      data: {
        status: newStatus as any,
        moderatorId: command.moderatorId,
        moderationNote: command.note,
      },
    });

    // If approved, recompute listing rating
    if (command.action === 'APPROVE') {
      await this.updateListingRating(review.listingId, command.tenantId);
    }

    this.logger.log(`Review ${command.reviewId} ${command.action}D by moderator ${command.moderatorId}`);
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
      data: { reviewCount: count, avgRating },
    });
  }
}
