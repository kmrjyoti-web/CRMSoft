import { IEventHandler } from '@nestjs/cqrs';
import { MarketplaceEngagementEvent } from './marketplace-engagement.event';
export declare class MarketplaceEngagementEventHandler implements IEventHandler<MarketplaceEngagementEvent> {
    private readonly logger;
    handle(event: MarketplaceEngagementEvent): void;
}
