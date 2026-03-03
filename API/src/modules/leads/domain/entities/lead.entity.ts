import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { LeadStatus } from '../value-objects/lead-status.vo';
import { LeadCreatedEvent } from '../events/lead-created.event';
import { LeadAllocatedEvent } from '../events/lead-allocated.event';
import { LeadStatusChangedEvent } from '../events/lead-status-changed.event';

export interface CreateLeadProps {
  leadNumber: string;
  contactId: string;
  organizationId?: string;
  priority: string;
  expectedValue?: number;
  expectedCloseDate?: Date;
  notes?: string;
  createdById: string;
}

/**
 * Lead Aggregate Root.
 * Contains ALL business rules for lead lifecycle.
 * No framework imports — pure domain logic.
 */
export class LeadEntity extends AggregateRoot {
  private _leadNumber: string;
  private _contactId: string;
  private _organizationId?: string;
  private _status: LeadStatus;
  private _priority: string;
  private _expectedValue?: number;
  private _expectedCloseDate?: Date;
  private _allocatedToId?: string;
  private _allocatedAt?: Date;
  private _lostReason?: string;
  private _notes?: string;
  private _isActive: boolean;
  private _isDeleted: boolean;
  private _deletedAt: Date | null;
  private _deletedById: string | null;
  private _createdById: string;

  /** Factory: Create new lead. Status = NEW. Emits LeadCreatedEvent. */
  static create(id: string, props: CreateLeadProps): LeadEntity {
    const lead = new LeadEntity();
    lead._id = id;
    lead._leadNumber = props.leadNumber;
    lead._contactId = props.contactId;
    lead._organizationId = props.organizationId;
    lead._status = LeadStatus.NEW;
    lead._priority = props.priority || 'MEDIUM';
    lead._expectedValue = props.expectedValue;
    lead._expectedCloseDate = props.expectedCloseDate;
    lead._notes = props.notes;
    lead._isActive = true;
    lead._isDeleted = false;
    lead._deletedAt = null;
    lead._deletedById = null;
    lead._createdById = props.createdById;
    lead._createdAt = new Date();
    lead._updatedAt = new Date();

    lead.addDomainEvent(new LeadCreatedEvent(id, props.contactId, props.createdById));
    return lead;
  }

  /** Reconstitute from DB — no events emitted. */
  static fromPersistence(data: any): LeadEntity {
    const lead = new LeadEntity();
    lead._id = data.id;
    lead._leadNumber = data.leadNumber;
    lead._contactId = data.contactId;
    lead._organizationId = data.organizationId;
    lead._status = LeadStatus.fromString(data.status);
    lead._priority = data.priority;
    lead._expectedValue = data.expectedValue;
    lead._expectedCloseDate = data.expectedCloseDate;
    lead._allocatedToId = data.allocatedToId;
    lead._allocatedAt = data.allocatedAt;
    lead._lostReason = data.lostReason;
    lead._notes = data.notes;
    lead._isActive = data.isActive ?? true;
    lead._isDeleted = data.isDeleted ?? false;
    lead._deletedAt = data.deletedAt ?? null;
    lead._deletedById = data.deletedById ?? null;
    lead._createdById = data.createdById;
    lead._createdAt = data.createdAt;
    lead._updatedAt = data.updatedAt;
    return lead;
  }

  /**
   * Allocate lead to a sales executive.
   * @rule Lead must be in NEW or VERIFIED status
   * @rule Emits LeadAllocatedEvent
   */
  allocate(userId: string): void {
    if (!userId) throw new Error('User ID is required for allocation');
    if (this._status.value !== 'NEW' && this._status.value !== 'VERIFIED') {
      throw new Error(`Cannot allocate lead in status ${this._status.value}. Must be NEW or VERIFIED.`);
    }
    this._allocatedToId = userId;
    this._allocatedAt = new Date();
    this._status = LeadStatus.ALLOCATED;
    this._updatedAt = new Date();
    this.addDomainEvent(new LeadAllocatedEvent(this._id, userId, this._contactId));
  }

  /**
   * Change lead status with validation.
   * @rule Only valid transitions allowed (see LeadStatus.canTransitionTo)
   * @rule Lost reason required when status = LOST
   * @rule Emits LeadStatusChangedEvent
   */
  changeStatus(newStatus: string, reason?: string): void {
    const target = LeadStatus.fromString(newStatus);
    if (!this._status.canTransitionTo(target)) {
      throw new Error(
        `Invalid transition: ${this._status.value} -> ${target.value}. \n` +
        `Valid transitions from ${this._status.value}: ${this._status.validTransitions().join(', ') || 'none (terminal state)'}`
      );
    }
    if (target.value === 'LOST' && !reason) {
      throw new Error('Lost reason is required when marking lead as LOST');
    }
    const old = this._status;
    this._status = target;
    if (reason) this._lostReason = reason;
    this._updatedAt = new Date();
    this.addDomainEvent(new LeadStatusChangedEvent(this._id, old.value, target.value));
  }

  /** Update lead details (non-status fields). */
  updateDetails(data: { priority?: string; expectedValue?: number; expectedCloseDate?: Date; notes?: string }): void {
    if (this._status.isTerminal()) {
      throw new Error(`Cannot update lead in terminal status: ${this._status.value}`);
    }
    if (data.priority) this._priority = data.priority;
    if (data.expectedValue !== undefined) this._expectedValue = data.expectedValue;
    if (data.expectedCloseDate) this._expectedCloseDate = data.expectedCloseDate;
    if (data.notes !== undefined) this._notes = data.notes;
    this._updatedAt = new Date();
  }

  /** Deactivate — hide from default list views */
  deactivate(): void {
    if (!this._isActive) throw new Error('Lead is already inactive');
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /** Reactivate — make visible in default list views */
  reactivate(): void {
    if (this._isActive) throw new Error('Lead is already active');
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Soft delete — mark as deleted without removing from persistence
   */
  softDelete(deletedById: string): void {
    if (this._isDeleted) {
      throw new Error('Lead is already deleted');
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
      throw new Error('Lead is not deleted');
    }
    this._isDeleted = false;
    this._isActive = true;
    this._deletedAt = null;
    this._deletedById = null;
    this._updatedAt = new Date();
  }

  // ─── Getters (read-only access to state) ───
  get leadNumber() { return this._leadNumber; }
  get contactId() { return this._contactId; }
  get organizationId() { return this._organizationId; }
  get status() { return this._status; }
  get priority() { return this._priority; }
  get expectedValue() { return this._expectedValue; }
  get expectedCloseDate() { return this._expectedCloseDate; }
  get allocatedToId() { return this._allocatedToId; }
  get allocatedAt() { return this._allocatedAt; }
  get lostReason() { return this._lostReason; }
  get notes() { return this._notes; }
  get isActive(): boolean { return this._isActive; }
  get isDeleted(): boolean { return this._isDeleted; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get deletedById(): string | null { return this._deletedById; }
  get createdById() { return this._createdById; }
}

