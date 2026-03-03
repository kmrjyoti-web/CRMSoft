import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { LeadStatusChangedEvent } from '../../domain/events/lead-status-changed.event';

@EventsHandler(LeadStatusChangedEvent)
export class OnLeadStatusChangedHandler implements IEventHandler<LeadStatusChangedEvent> {
  private readonly logger = new Logger(OnLeadStatusChangedHandler.name);

  handle(event: LeadStatusChangedEvent): void {
    this.logger.log(
      `Lead ${event.leadId}: ${event.fromStatus} → ${event.toStatus}`,
    );
    // Future: Trigger follow-up activities based on status
    // Future: Send notifications (WON → celebrate, LOST → review)
    // Future: Update analytics/dashboards
  }
}
