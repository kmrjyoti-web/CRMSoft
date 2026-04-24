import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RawContactCreatedEvent } from '../../domain/events/raw-contact-created.event';

@EventsHandler(RawContactCreatedEvent)
export class OnRawContactCreatedHandler implements IEventHandler<RawContactCreatedEvent> {
  private readonly logger = new Logger(OnRawContactCreatedHandler.name);

  handle(event: RawContactCreatedEvent): void {
    try {
      this.logger.log(
        `New raw contact: ${event.firstName} ${event.lastName} (source: ${event.source})`,
      );
      // Future: Auto-assign ownership
      // Future: Duplicate detection
    } catch (error) {
      this.logger.error(`OnRawContactCreatedHandler failed: ${(error as Error).message}`, (error as Error).stack);
    }
  }
}
