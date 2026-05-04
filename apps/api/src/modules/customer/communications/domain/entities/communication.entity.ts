import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { CommunicationType } from '../../../../../shared/domain/value-objects/communication-type.vo';
import { PriorityType } from '../../../../../shared/domain/value-objects/priority-type.vo';
import { Email } from '../../../../../shared/domain/value-objects/email.vo';
import { Phone } from '../../../../../shared/domain/value-objects/phone.vo';

export interface CreateCommunicationProps {
  type: string;
  value: string;
  priorityType?: string;
  isPrimary?: boolean;
  label?: string;
  rawContactId?: string;
  contactId?: string;
  organizationId?: string;
  leadId?: string;
  notes?: string;
}

/**
 * Communication Aggregate Root.
 *
 * Rules:
 * 1. type=EMAIL ? value must be valid email format
 * 2. type=PHONE/MOBILE ? value must be valid phone format
 * 3. At least one entity link is required (rawContactId, contactId, etc.)
 * 4. linkToContact(contactId) — called when raw contact is verified
 * 5. linkToOrganization(orgId) — called when number is org's primary
 * 6. linkToLead(leadId) — when lead is created from contact
 */
export class CommunicationEntity extends AggregateRoot {
  private _type: CommunicationType;
  private _value: string;
  private _priorityType: PriorityType;
  private _isPrimary: boolean;
  private _isVerified: boolean;
  private _label?: string;
  private _rawContactId?: string;
  private _contactId?: string;
  private _organizationId?: string;
  private _leadId?: string;
  private _notes?: string;

  static create(id: string, props: CreateCommunicationProps): CommunicationEntity {
    const commType = CommunicationType.fromString(props.type);

    // Validate value based on type
    if (commType.isEmail()) {
      Email.create(props.value); // throws if invalid
    } else if (commType.isPhone()) {
      Phone.create(props.value); // throws if invalid
    }
    if (!props.value || props.value.trim().length === 0) {
      throw new Error('Communication value is required');
    }

    // At least one link required
    if (!props.rawContactId && !props.contactId && !props.organizationId && !props.leadId) {
      throw new Error('At least one entity link is required (rawContactId, contactId, organizationId, or leadId)');
    }

    const comm = new CommunicationEntity();
    comm._id = id;
    comm._type = commType;
    comm._value = props.value.trim();
    comm._priorityType = props.priorityType
      ? PriorityType.fromString(props.priorityType)
      : PriorityType.PRIMARY;
    comm._isPrimary = props.isPrimary ?? false;
    comm._isVerified = false;
    comm._label = props.label?.trim();
    comm._rawContactId = props.rawContactId;
    comm._contactId = props.contactId;
    comm._organizationId = props.organizationId;
    comm._leadId = props.leadId;
    comm._notes = props.notes?.trim();
    comm._createdAt = new Date();
    comm._updatedAt = new Date();
    return comm;
  }

  static fromPersistence(data: any): CommunicationEntity {
    const comm = new CommunicationEntity();
    comm._id = data.id;
    comm._type = CommunicationType.fromString(data.type);
    comm._value = data.value;
    comm._priorityType = PriorityType.fromString(data.priorityType);
    comm._isPrimary = data.isPrimary;
    comm._isVerified = data.isVerified;
    comm._label = data.label;
    comm._rawContactId = data.rawContactId;
    comm._contactId = data.contactId;
    comm._organizationId = data.organizationId;
    comm._leadId = data.leadId;
    comm._notes = data.notes;
    comm._createdAt = data.createdAt;
    comm._updatedAt = data.updatedAt;
    return comm;
  }

  /**
   * Link to verified Contact.
   * Called when RawContact is verified ? Contact created.
   */
  linkToContact(contactId: string): void {
    if (!contactId) throw new Error('Contact ID is required');
    this._contactId = contactId;
    this._updatedAt = new Date();
  }

  /**
   * Link to Organization.
   * Called when this number is marked as org's primary.
   */
  linkToOrganization(organizationId: string): void {
    if (!organizationId) throw new Error('Organization ID is required');
    this._organizationId = organizationId;
    this._updatedAt = new Date();
  }

  /** Link to Lead */
  linkToLead(leadId: string): void {
    if (!leadId) throw new Error('Lead ID is required');
    this._leadId = leadId;
    this._updatedAt = new Date();
  }

  /** Mark as verified (e.g., OTP verified, email confirmed) */
  markVerified(): void {
    this._isVerified = true;
    this._updatedAt = new Date();
  }

  /** Change priority type */
  changePriority(newPriority: string): void {
    this._priorityType = PriorityType.fromString(newPriority);
    this._updatedAt = new Date();
  }

  /** Set as primary for this entity */
  setAsPrimary(): void {
    this._isPrimary = true;
    this._updatedAt = new Date();
  }

  unsetPrimary(): void {
    this._isPrimary = false;
    this._updatedAt = new Date();
  }

  // Getters
  get type(): CommunicationType { return this._type; }
  get value(): string { return this._value; }
  get priorityType(): PriorityType { return this._priorityType; }
  get isPrimary(): boolean { return this._isPrimary; }
  get isVerified(): boolean { return this._isVerified; }
  get label(): string | undefined { return this._label; }
  get rawContactId(): string | undefined { return this._rawContactId; }
  get contactId(): string | undefined { return this._contactId; }
  get organizationId(): string | undefined { return this._organizationId; }
  get leadId(): string | undefined { return this._leadId; }
  get notes(): string | undefined { return this._notes; }
}
