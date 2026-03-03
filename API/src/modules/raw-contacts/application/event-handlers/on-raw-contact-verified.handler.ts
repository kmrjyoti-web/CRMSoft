import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RawContactVerifiedEvent } from '../../domain/events/raw-contact-verified.event';

/**
 * Reacts to RawContactVerifiedEvent.
 * The heavy lifting (create Contact, update Communications) is done
 * in VerifyRawContactHandler. This handler is for side effects:
 * - Notifications
 * - Audit logging
 * - Auto-create Lead (future)
 */
@EventsHandler(RawContactVerifiedEvent)
export class OnRawContactVerifiedHandler implements IEventHandler<RawContactVerifiedEvent> {
  private readonly logger = new Logger(OnRawContactVerifiedHandler.name);

  handle(event: RawContactVerifiedEvent): void {
    this.logger.log(
      `RawContact ${event.rawContactId} → Contact ${event.contactId} ` +
        `(verified by ${event.verifiedById})`,
    );
    // Future: Auto-create Lead from new Contact
    // Future: Notify manager
  }
}
