import { IEventHandler } from '@nestjs/cqrs';
import { ContactDeactivatedEvent } from '../../domain/events/contact-deactivated.event';
export declare class OnContactDeactivatedHandler implements IEventHandler<ContactDeactivatedEvent> {
    private readonly logger;
    handle(event: ContactDeactivatedEvent): void;
}
