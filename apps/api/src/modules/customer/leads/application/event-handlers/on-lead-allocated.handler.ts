import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { LeadAllocatedEvent } from '../../domain/events/lead-allocated.event';

@EventsHandler(LeadAllocatedEvent)
export class OnLeadAllocatedHandler implements IEventHandler<LeadAllocatedEvent> {
  private readonly logger = new Logger(OnLeadAllocatedHandler.name);

  handle(event: LeadAllocatedEvent): void {
    try {
      this.logger.log(
        `Lead ${event.leadId} allocated to ${event.allocatedToId}`,
      );
      // Future: Send notification to assigned user
      // Future: Create ownership record
      // Future: Start SLA timer
    } catch (error) {
      this.logger.error(`OnLeadAllocatedHandler failed: ${(error as Error).message}`, (error as Error).stack);
    }
  }
}
