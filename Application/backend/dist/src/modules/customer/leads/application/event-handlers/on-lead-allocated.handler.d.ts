import { IEventHandler } from '@nestjs/cqrs';
import { LeadAllocatedEvent } from '../../domain/events/lead-allocated.event';
export declare class OnLeadAllocatedHandler implements IEventHandler<LeadAllocatedEvent> {
    private readonly logger;
    handle(event: LeadAllocatedEvent): void;
}
