import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OrganizationDeactivatedEvent } from '../../domain/events/organization-deactivated.event';

@EventsHandler(OrganizationDeactivatedEvent)
export class OnOrganizationDeactivatedHandler implements IEventHandler<OrganizationDeactivatedEvent> {
  private readonly logger = new Logger(OnOrganizationDeactivatedHandler.name);

  handle(event: OrganizationDeactivatedEvent): void {
    try {
      this.logger.log(`Organization deactivated: ${event.name} (${event.organizationId})`);
      // Future: Deactivate associated leads
      // Future: Notify account managers
    } catch (error) {
      this.logger.error(`OnOrganizationDeactivatedHandler failed: ${(error as Error).message}`, (error as Error).stack);
    }
  }
}
