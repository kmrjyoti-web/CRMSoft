import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { ContactCreatedEvent } from '../events/contact-created.event';
import { ContactUpdatedEvent } from '../events/contact-updated.event';
import { ContactDeactivatedEvent } from '../events/contact-deactivated.event';

export interface CreateContactProps {
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  notes?: string;
  createdById: string;
}

export interface UpdateContactProps {
  firstName?: string;
  lastName?: string;
  designation?: string;
  department?: string;
  notes?: string;
}

/**
 * Contact Aggregate Root — represents a VERIFIED contact.
 *
 * Contacts are created in two ways:
 * 1. From RawContact verification (VerifyRawContactHandler creates the Contact)
 * 2. Directly by admin (CreateContactCommand)
 *
 * Communications (phone, email) are managed separately in the Communication module.
 * Organization links are managed via ContactOrganization module.
 */
export class ContactEntity extends AggregateRoot {
  private _firstName: string;
  private _lastName: string;
  private _designation?: string;
  private _department?: string;
  private _notes?: string;
  private _isActive: boolean;
  private _isDeleted: boolean;
  private _deletedAt: Date | null;
  private _deletedById: string | null;
  private _createdById: string;

  /**
   * Factory: Create new verified Contact
   */
  static create(id: string, props: CreateContactProps): ContactEntity {
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    const c = new ContactEntity();
    c._id = id;
    c._firstName = props.firstName.trim();
    c._lastName = props.lastName.trim();
    c._designation = props.designation?.trim() || undefined;
    c._department = props.department?.trim() || undefined;
    c._notes = props.notes?.trim() || undefined;
    c._isActive = true;
    c._isDeleted = false;
    c._deletedAt = null;
    c._deletedById = null;
    c._createdById = props.createdById;
    c._createdAt = new Date();
    c._updatedAt = new Date();

    c.addDomainEvent(
      new ContactCreatedEvent(id, c._firstName, c._lastName, props.createdById),
    );
    return c;
  }

  /**
   * Reconstitute from persistence
   */
  static fromPersistence(data: any): ContactEntity {
    const c = new ContactEntity();
    c._id = data.id;
    c._firstName = data.firstName;
    c._lastName = data.lastName;
    c._designation = data.designation ?? undefined;
    c._department = data.department ?? undefined;
    c._notes = data.notes ?? undefined;
    c._isActive = data.isActive ?? true;
    c._isDeleted = data.isDeleted ?? false;
    c._deletedAt = data.deletedAt ?? null;
    c._deletedById = data.deletedById ?? null;
    c._createdById = data.createdById;
    c._createdAt = data.createdAt;
    c._updatedAt = data.updatedAt;
    return c;
  }

  /**
   * Update details — only active contacts can be updated
   */
  updateDetails(data: UpdateContactProps, updatedById: string): void {
    if (!this._isActive) {
      throw new Error('Cannot update deactivated contact');
    }

    const changed: string[] = [];

    if (data.firstName !== undefined) {
      if (data.firstName.trim().length === 0) {
        throw new Error('First name cannot be empty');
      }
      this._firstName = data.firstName.trim();
      changed.push('firstName');
    }
    if (data.lastName !== undefined) {
      if (data.lastName.trim().length === 0) {
        throw new Error('Last name cannot be empty');
      }
      this._lastName = data.lastName.trim();
      changed.push('lastName');
    }
    if (data.designation !== undefined) {
      this._designation = data.designation?.trim() || undefined;
      changed.push('designation');
    }
    if (data.department !== undefined) {
      this._department = data.department?.trim() || undefined;
      changed.push('department');
    }
    if (data.notes !== undefined) {
      this._notes = data.notes?.trim() || undefined;
      changed.push('notes');
    }

    if (changed.length === 0) {
      throw new Error('No fields provided to update');
    }

    this._updatedAt = new Date();
    this.addDomainEvent(new ContactUpdatedEvent(this._id, changed, updatedById));
  }

  /**
   * Deactivate — soft delete
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new Error('Contact is already deactivated');
    }
    this._isActive = false;
    this._updatedAt = new Date();
    this.addDomainEvent(
      new ContactDeactivatedEvent(this._id, this._firstName, this._lastName),
    );
  }

  /**
   * Reactivate — bring back
   */
  reactivate(): void {
    if (this._isActive) {
      throw new Error('Contact is already active');
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Soft delete — mark as deleted without removing from persistence
   */
  softDelete(deletedById: string): void {
    if (this._isDeleted) {
      throw new Error('Contact is already deleted');
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
      throw new Error('Contact is not deleted');
    }
    this._isDeleted = false;
    this._isActive = true;
    this._deletedAt = null;
    this._deletedById = null;
    this._updatedAt = new Date();
  }

  // ─── Getters ───
  get fullName(): string { return `${this._firstName} ${this._lastName}`; }
  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get designation(): string | undefined { return this._designation; }
  get department(): string | undefined { return this._department; }
  get notes(): string | undefined { return this._notes; }
  get isActive(): boolean { return this._isActive; }
  get isDeleted(): boolean { return this._isDeleted; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get deletedById(): string | null { return this._deletedById; }
  get createdById(): string { return this._createdById; }
}
