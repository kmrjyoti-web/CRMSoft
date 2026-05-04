import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { LeadCreatedEvent } from '../../domain/events/lead-created.event';

@EventsHandler(LeadCreatedEvent)
export class OnLeadCreatedHandler implements IEventHandler<LeadCreatedEvent> {
  private readonly logger = new Logger(OnLeadCreatedHandler.name);

  handle(event: LeadCreatedEvent): void {
    try {
      this.logger.log(
        `Lead ${event.leadId} created for contact ${event.contactId}`,
      );
      // Future: Auto-allocate based on rules (round-robin, territory, etc.)
      // Future: Create ownership record
      // Future: Notify sales manager
    } catch (error) {
      this.logger.error(`OnLeadCreatedHandler failed: ${(error as Error).message}`, (error as Error).stack);
    }
  }
}
