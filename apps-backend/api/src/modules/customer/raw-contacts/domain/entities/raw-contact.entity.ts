import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { RawContactStatus } from '../value-objects/raw-contact-status.vo';
import { RawContactCreatedEvent } from '../events/raw-contact-created.event';
import { RawContactVerifiedEvent } from '../events/raw-contact-verified.event';

export interface CreateRawContactProps {
  firstName: string;
  lastName: string;
  source?: string;
  companyName?: string;
  designation?: string;
  department?: string;
  notes?: string;
  createdById: string;
}

/**
 * RawContact Aggregate Root.
 *
 * Business Rules:
 * 1. Starts as RAW status
 * 2. verify(contactId, verifiedById) ? VERIFIED
 * 3. reject(reason) ? REJECTED
 * 4. markDuplicate() ? DUPLICATE
 * 5. VERIFIED and DUPLICATE are terminal
 * 6. REJECTED can be re-opened back to RAW
 * 7. Communication records linked via events
 */
export class RawContactEntity extends AggregateRoot {
  private _firstName: string;
  private _lastName: string;
  private _status: RawContactStatus;
  private _source: string;
  private _companyName?: string;
  private _designation?: string;
  private _department?: string;
  private _notes?: string;
  private _verifiedAt?: Date;
  private _verifiedById?: string;
  private _contactId?: string;
  private _isActive: boolean;
  private _isDeleted: boolean;
  private _deletedAt: Date | null;
  private _deletedById: string | null;
  private _createdById: string;

  static create(id: string, props: CreateRawContactProps): RawContactEntity {
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    const rc = new RawContactEntity();
    rc._id = id;
    rc._firstName = props.firstName.trim();
    rc._lastName = props.lastName.trim();
    rc._status = RawContactStatus.RAW;
    rc._source = props.source || 'MANUAL';
    rc._companyName = props.companyName?.trim();
    rc._designation = props.designation?.trim();
    rc._department = props.department?.trim();
    rc._notes = props.notes?.trim();
    rc._isActive = true;
    rc._isDeleted = false;
    rc._deletedAt = null;
    rc._deletedById = null;
    rc._createdById = props.createdById;
    rc._createdAt = new Date();
    rc._updatedAt = new Date();

    rc.addDomainEvent(
      new RawContactCreatedEvent(id, rc._firstName, rc._lastName, rc._source, props.createdById),
    );
    return rc;
  }

  static fromPersistence(data: any): RawContactEntity {
    const rc = new RawContactEntity();
    rc._id = data.id;
    rc._firstName = data.firstName;
    rc._lastName = data.lastName;
    rc._status = RawContactStatus.fromString(data.status);
    rc._source = data.source;
    rc._companyName = data.companyName ?? undefined;
    rc._designation = data.designation ?? undefined;
    rc._department = data.department ?? undefined;
    rc._notes = data.notes ?? undefined;
    rc._verifiedAt = data.verifiedAt ?? undefined;
    rc._verifiedById = data.verifiedById ?? undefined;
    rc._contactId = data.contactId ?? undefined;
    rc._isActive = data.isActive ?? true;
    rc._isDeleted = data.isDeleted ?? false;
    rc._deletedAt = data.deletedAt ?? null;
    rc._deletedById = data.deletedById ?? null;
    rc._createdById = data.createdById;
    rc._createdAt = data.createdAt;
    rc._updatedAt = data.updatedAt;
    return rc;
  }

  /**
   * Verify this raw contact ? creates a Contact.
   * @param contactId The new Contact record's ID
   * @param verifiedById Who verified it
   * @rule Only RAW status can be verified
   * @emits RawContactVerifiedEvent ? triggers:
   *   1. Create Contact record
   *   2. Update Communication records (set contactId)
   */
  verify(contactId: string, verifiedById: string): void {
    if (!contactId) throw new Error('Contact ID is required for verification');
    if (!verifiedById) throw new Error('Verified by user ID is required');

    const target = RawContactStatus.VERIFIED;
    if (!this._status.canTransitionTo(target)) {
      throw new Error(`Cannot verify raw contact in status ${this._status.value}`);
    }

    this._status = target;
    this._contactId = contactId;
    this._verifiedAt = new Date();
    this._verifiedById = verifiedById;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new RawContactVerifiedEvent(this._id, contactId, verifiedById, this._companyName),
    );
  }

  /** Reject this raw contact */
  reject(reason?: string): void {
    const target = RawContactStatus.REJECTED;
    if (!this._status.canTransitionTo(target)) {
      throw new Error(`Cannot reject raw contact in status ${this._status.value}`);
    }
    this._status = target;
    if (reason) this._notes = reason;
    this._updatedAt = new Date();
  }

  /** Mark as duplicate */
  markDuplicate(): void {
    const target = RawContactStatus.DUPLICATE;
    if (!this._status.canTransitionTo(target)) {
      throw new Error(`Cannot mark duplicate from status ${this._status.value}`);
    }
    this._status = target;
    this._updatedAt = new Date();
  }

  /** Re-open a rejected contact */
  reopen(): void {
    const target = RawContactStatus.RAW;
    if (!this._status.canTransitionTo(target)) {
      throw new Error(`Cannot reopen from status ${this._status.value}`);
    }
    this._status = target;
    this._updatedAt = new Date();
  }

  updateDetails(data: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    designation?: string;
    department?: string;
    notes?: string;
  }): void {
    if (this._status.isTerminal()) {
      throw new Error(`Cannot update raw contact in terminal status ${this._status.value}`);
    }
    if (data.firstName !== undefined) {
      if (data.firstName.trim().length === 0) throw new Error('First name cannot be empty');
      this._firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined) {
      if (data.lastName.trim().length === 0) throw new Error('Last name cannot be empty');
      this._lastName = data.lastName.trim();
    }
    if (data.companyName !== undefined) this._companyName = data.companyName?.trim();
    if (data.designation !== undefined) this._designation = data.designation?.trim();
    if (data.department !== undefined) this._department = data.department?.trim();
    if (data.notes !== undefined) this._notes = data.notes?.trim();
    this._updatedAt = new Date();
  }

  /** Deactivate — hide from default list views */
  deactivate(): void {
    if (!this._isActive) throw new Error('RawContact is already inactive');
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /** Reactivate — make visible in default list views */
  reactivate(): void {
    if (this._isActive) throw new Error('RawContact is already active');
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Soft delete — mark as deleted without removing from persistence
   */
  softDelete(deletedById: string): void {
    if (this._isDeleted) {
      throw new Error('RawContact is already deleted');
    }
    this._isDeleted = true;
    this._isActive = false;
    this._deletedAt = new Date();
    this._deletedById = deletedById;
    this._updatedAt = new Date();
  }

  /**
   * Restore — reverse a soft delete
   */
  restore(): void {
    if (!this._isDeleted) {
      throw new Error('RawContact is not deleted');
    }
    this._isDeleted = false;
    this._isActive = true;
    this._deletedAt = null;
    this._deletedById = null;
    this._updatedAt = new Date();
  }

  get fullName(): string { return `${this._firstName} ${this._lastName}`; }
  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get status(): RawContactStatus { return this._status; }
  get source(): string { return this._source; }
  get companyName(): string | undefined { return this._companyName; }
  get designation(): string | undefined { return this._designation; }
  get department(): string | undefined { return this._department; }
  get notes(): string | undefined { return this._notes; }
  get verifiedAt(): Date | undefined { return this._verifiedAt; }
  get verifiedById(): string | undefined { return this._verifiedById; }
  get contactId(): string | undefined { return this._contactId; }
  get isActive(): boolean { return this._isActive; }
  get isDeleted(): boolean { return this._isDeleted; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get deletedById(): string | null { return this._deletedById; }
  get createdById(): string { return this._createdById; }
}
