import { DomainEvent } from '../../../../shared/domain/domain-event';

/**
 * Emitted when RawContact → verified.
 * Downstream:
 * 1. Create Contact record
 * 2. Update all Communication records (set contactId)
 * 3. If org primary → update org communication
 */
export class RawContactVerifiedEvent extends DomainEvent {
  constructor(
    public readonly rawContactId: string,
    public readonly contactId: string,
    public readonly verifiedById: string,
    public readonly companyName: string | undefined,
  ) {
    super(rawContactId, 'RawContactVerified');
  }
}
