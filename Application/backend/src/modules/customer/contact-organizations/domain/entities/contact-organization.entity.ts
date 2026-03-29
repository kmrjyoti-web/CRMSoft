import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { ContactOrgRelation } from '../../../../../shared/domain/value-objects/contact-org-relation.vo';

export interface CreateContactOrgProps {
  contactId: string;
  organizationId: string;
  relationType?: string;
  isPrimary?: boolean;
  designation?: string;
  department?: string;
  startDate?: Date;
  notes?: string;
}

/**
 * ContactOrganization — maps Contact to Organization.
 *
 * Rules:
 * 1. One contact can have multiple org relationships
 * 2. relationType: PRIMARY_CONTACT, EMPLOYEE, CONSULTANT, etc.
 * 3. Only ONE primary contact per organization
 * 4. isPrimary=true marks this contact as the org's primary point of contact
 */
export class ContactOrganizationEntity extends AggregateRoot {
  private _contactId: string;
  private _organizationId: string;
  private _relationType: ContactOrgRelation;
  private _isPrimary: boolean;
  private _designation?: string;
  private _department?: string;
  private _startDate?: Date;
  private _endDate?: Date;
  private _isActive: boolean;
  private _notes?: string;

  static create(id: string, props: CreateContactOrgProps): ContactOrganizationEntity {
    if (!props.contactId) throw new Error('Contact ID is required');
    if (!props.organizationId) throw new Error('Organization ID is required');

    const co = new ContactOrganizationEntity();
    co._id = id;
    co._contactId = props.contactId;
    co._organizationId = props.organizationId;
    co._relationType = props.relationType
      ? ContactOrgRelation.fromString(props.relationType)
      : ContactOrgRelation.EMPLOYEE;
    co._isPrimary = props.isPrimary ?? false;
    co._designation = props.designation?.trim();
    co._department = props.department?.trim();
    co._startDate = props.startDate;
    co._isActive = true;
    co._notes = props.notes?.trim();
    co._createdAt = new Date();
    co._updatedAt = new Date();
    return co;
  }

  static fromPersistence(data: any): ContactOrganizationEntity {
    const co = new ContactOrganizationEntity();
    co._id = data.id;
    co._contactId = data.contactId;
    co._organizationId = data.organizationId;
    co._relationType = ContactOrgRelation.fromString(data.relationType);
    co._isPrimary = data.isPrimary;
    co._designation = data.designation;
    co._department = data.department;
    co._startDate = data.startDate;
    co._endDate = data.endDate;
    co._isActive = data.isActive;
    co._notes = data.notes;
    co._createdAt = data.createdAt;
    co._updatedAt = data.updatedAt;
    return co;
  }

  /** Mark as primary contact for this organization */
  setAsPrimary(): void {
    this._isPrimary = true;
    this._updatedAt = new Date();
  }

  unsetPrimary(): void {
    this._isPrimary = false;
    this._updatedAt = new Date();
  }

  /** Deactivate relationship (e.g., employee left) */
  deactivate(endDate?: Date): void {
    this._isActive = false;
    this._endDate = endDate || new Date();
    this._updatedAt = new Date();
  }

  reactivate(): void {
    this._isActive = true;
    this._endDate = undefined;
    this._updatedAt = new Date();
  }

  changeRelationType(newType: string): void {
    this._relationType = ContactOrgRelation.fromString(newType);
    this._updatedAt = new Date();
  }

  get contactId(): string { return this._contactId; }
  get organizationId(): string { return this._organizationId; }
  get relationType(): ContactOrgRelation { return this._relationType; }
  get isPrimary(): boolean { return this._isPrimary; }
  get designation(): string | undefined { return this._designation; }
  get department(): string | undefined { return this._department; }
  get startDate(): Date | undefined { return this._startDate; }
  get endDate(): Date | undefined { return this._endDate; }
  get isActive(): boolean { return this._isActive; }
  get notes(): string | undefined { return this._notes; }
}
