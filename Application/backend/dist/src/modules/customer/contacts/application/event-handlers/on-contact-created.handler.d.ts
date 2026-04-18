import { IEventHandler } from '@nestjs/cqrs';
import { ContactCreatedEvent } from '../../domain/events/contact-created.event';
export declare class OnContactCreatedHandler implements IEventHandler<ContactCreatedEvent> {
    private readonly logger;
    handle(event: ContactCreatedEvent): void;
}
