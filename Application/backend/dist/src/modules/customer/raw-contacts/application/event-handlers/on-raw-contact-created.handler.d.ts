import { IEventHandler } from '@nestjs/cqrs';
import { RawContactCreatedEvent } from '../../domain/events/raw-contact-created.event';
export declare class OnRawContactCreatedHandler implements IEventHandler<RawContactCreatedEvent> {
    private readonly logger;
    handle(event: RawContactCreatedEvent): void;
}
