import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ContactDeactivatedEvent } from '../../domain/events/contact-deactivated.event';

@EventsHandler(ContactDeactivatedEvent)
export class OnContactDeactivatedHandler implements IEventHandler<ContactDeactivatedEvent> {
  private readonly logger = new Logger(OnContactDeactivatedHandler.name);

  handle(event: ContactDeactivatedEvent): void {
    this.logger.log(
      `Contact deactivated: ${event.firstName} ${event.lastName} (${event.contactId})`,
    );
    // Future: Notify assigned owners
    // Future: Update related leads
  }
}
