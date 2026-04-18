import { IEventHandler } from '@nestjs/cqrs';
import { LeadStatusChangedEvent } from '../../domain/events/lead-status-changed.event';
export declare class OnLeadStatusChangedHandler implements IEventHandler<LeadStatusChangedEvent> {
    private readonly logger;
    handle(event: LeadStatusChangedEvent): void;
}
