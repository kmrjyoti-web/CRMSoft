import { IEventHandler } from '@nestjs/cqrs';
import { LeadCreatedEvent } from '../../domain/events/lead-created.event';
export declare class OnLeadCreatedHandler implements IEventHandler<LeadCreatedEvent> {
    private readonly logger;
    handle(event: LeadCreatedEvent): void;
}
