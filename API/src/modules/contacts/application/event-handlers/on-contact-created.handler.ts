import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ContactCreatedEvent } from '../../domain/events/contact-created.event';

@EventsHandler(ContactCreatedEvent)
export class OnContactCreatedHandler implements IEventHandler<ContactCreatedEvent> {
  private readonly logger = new Logger(OnContactCreatedHandler.name);

  handle(event: ContactCreatedEvent): void {
    this.logger.log(
      `Contact created: ${event.firstName} ${event.lastName} by ${event.createdById}`,
    );
    // Future: Auto-assign ownership
    // Future: Trigger welcome notification
  }
}
