import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrganizationCreatedEvent } from '../../domain/events/organization-created.event';

@EventsHandler(OrganizationCreatedEvent)
export class OnOrganizationCreatedHandler implements IEventHandler<OrganizationCreatedEvent> {
  private readonly logger = new Logger(OnOrganizationCreatedHandler.name);

  handle(event: OrganizationCreatedEvent): void {
    this.logger.log(
      `New organization: ${event.name} (industry: ${event.industry || 'N/A'})`,
    );
    // Future: Auto-assign ownership
    // Future: Enrich data from GST API
  }
}
