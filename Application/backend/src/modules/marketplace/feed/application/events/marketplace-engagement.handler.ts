import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { MarketplaceEngagementEvent } from './marketplace-engagement.event';

@EventsHandler(MarketplaceEngagementEvent)
export class MarketplaceEngagementEventHandler implements IEventHandler<MarketplaceEngagementEvent> {
  private readonly logger = new Logger(MarketplaceEngagementEventHandler.name);

  handle(event: MarketplaceEngagementEvent): void {
    this.logger.log(
      `[Marketplace Engagement] type=${event.type} actor=${event.actorId} ` +
      `target=${event.targetUserId} entity=${event.entityType}:${event.entityId} ` +
      `tenant=${event.tenantId}`,
    );
    // Future: integrate with notification service
  }
}
