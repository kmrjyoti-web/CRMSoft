import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PostRequirementCommand } from './post-requirement.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@CommandHandler(PostRequirementCommand)
@Injectable()
export class PostRequirementHandler implements ICommandHandler<PostRequirementCommand> {
  private readonly logger = new Logger(PostRequirementHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: PostRequirementCommand): Promise<string> {
    try {
      const id = randomUUID();

      const requirementConfig: Record<string, any> = {};
      if (command.quantity !== undefined) requirementConfig.quantity = command.quantity;
      if (command.targetPrice !== undefined) requirementConfig.targetPrice = command.targetPrice;
      if (command.deadline) requirementConfig.deadline = command.deadline;

      const listing = await this.mktPrisma.client.mktListing.create({
        data: {
          id,
          tenantId: command.tenantId,
          authorId: command.authorId,
          createdById: command.authorId,
          listingType: 'REQUIREMENT',
          title: command.title,
          description: command.description,
          categoryId: command.categoryId,
          mediaUrls: command.mediaUrls ?? [],
          currency: command.currency ?? 'INR',
          requirementConfig,
          attributes: command.attributes ?? {},
          keywords: command.keywords ?? [],
          status: 'ACTIVE',
          publishedAt: new Date(),
        },
      });

      // Find matching sellers (listings in same category)
      if (command.categoryId) {
        const matchingListings = await this.mktPrisma.client.mktListing.findMany({
          where: {
            tenantId: command.tenantId,
            categoryId: command.categoryId,
            listingType: { not: 'REQUIREMENT' } as any,
            status: 'ACTIVE',
            isDeleted: false,
          },
          select: { id: true, authorId: true },
          take: 50,
        });

        this.logger.log(
          `Requirement ${id} matched ${matchingListings.length} potential sellers in category ${command.categoryId}`,
        );
      }

      this.logger.log(`Requirement posted: ${listing.id} by ${command.authorId}`);
      return listing.id;
    } catch (error) {
      this.logger.error(`PostRequirementHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
