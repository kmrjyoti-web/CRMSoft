import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TrackEventCommand } from './track-event.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

/**
 * TrackEventHandler � FAST, fire-and-forget analytics event insertion.
 *
 * Design principles:
 * 1. Insert raw event into MktAnalyticsEvent table (append-only, no computation).
 * 2. Update denormalized counters on the entity (viewCount, likeCount, etc.)
 *    for real-time display � these are eventually consistent.
 * 3. Summary computation (CTR, conversion rates) is done by BullMQ aggregator
 *    job, NOT inline here.
 */
@CommandHandler(TrackEventCommand)
@Injectable()
export class TrackEventHandler implements ICommandHandler<TrackEventCommand> {
  private readonly logger = new Logger(TrackEventHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(command: TrackEventCommand): Promise<void> {
    try {
      // 1. Insert raw analytics event (fast, append-only)
      await this.mktPrisma.client.mktAnalyticsEvent.create({
        data: {
          id: randomUUID(),
          tenantId: command.tenantId,
          entityType: command.entityType as any,
          entityId: command.entityId,
          eventType: command.eventType as any,
          userId: command.userId,
          source: (command.source as any) ?? 'FEED',
          deviceType: command.deviceType,
          city: command.city,
          state: command.state,
          pincode: command.pincode,
          orderValue: command.orderValue,
          metadata: command.metadata ?? {},
        },
      });

      // 2. Update denormalized counter on entity (best-effort � non-blocking)
      this.updateEntityCounter(command).catch((err) =>
        this.logger.warn(`Counter update failed for ${command.entityType}/${command.entityId}: ${err.message}`),
      );
    } catch (error) {
      this.logger.error(`TrackEventHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  private async updateEntityCounter(command: TrackEventCommand): Promise<void> {
    const { entityType, entityId, eventType } = command;

    if (entityType === 'LISTING') {
      const counterMap: Record<string, any> = {
        VIEW: { viewCount: { increment: 1 } },
        ENQUIRY: { enquiryCount: { increment: 1 } },
        ORDER: { orderCount: { increment: 1 } },
      };
      const data = counterMap[eventType];
      if (data) {
        await this.mktPrisma.client.mktListing.updateMany({
          where: { id: entityId },
          data,
        });
      }
    }

    if (entityType === 'POST') {
      const counterMap: Record<string, any> = {
        VIEW: { viewCount: { increment: 1 } },
        SHARE: { shareCount: { increment: 1 } },
      };
      const data = counterMap[eventType];
      if (data) {
        await this.mktPrisma.client.mktPost.updateMany({
          where: { id: entityId },
          data,
        });
      }
    }

    if (entityType === 'OFFER') {
      const counterMap: Record<string, any> = {
        IMPRESSION: { impressionCount: { increment: 1 } },
        CLICK: { clickCount: { increment: 1 } },
        ENQUIRY: { enquiryCount: { increment: 1 } },
        LEAD: { leadCount: { increment: 1 } },
      };
      const data = counterMap[eventType];
      if (data) {
        await this.mktPrisma.client.mktOffer.updateMany({
          where: { id: entityId },
          data,
        });
      }
    }
  }
}
