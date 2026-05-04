import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { OrganizationCreatedEvent } from '../events/organization-created.event';
import { OrganizationUpdatedEvent } from '../events/organization-updated.event';
import { OrganizationDeactivatedEvent } from '../events/organization-deactivated.event';

export interface CreateOrganizationProps {
  name: string;
  tenantId?: string;
  website?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  industry?: string;
  annualRevenue?: number;
  notes?: string;
  createdById: string;
}

export interface UpdateOrganizationProps {
  name?: string;
  website?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  industry?: string;
  annualRevenue?: number;
  notes?: string;
}

export class OrganizationEntity extends AggregateRoot {
  private _name: string;
  private _tenantId: string;
  private _website?: string;
  private _email?: string;
  private _phone?: string;
  private _gstNumber?: string;
  private _address?: string;
  private _city?: string;
  private _state?: string;
  private _country?: string;
  private _pincode?: string;
  private _industry?: string;
  private _annualRevenue?: number;
  private _notes?: string;
  private _isActive: boolean;
  private _createdById: string;
  private _isDeleted: boolean;
  private _deletedAt: Date | null;
  private _deletedById: string | null;

  /**
   * Factory: Create new Organization
   * Business rules: name required (min 2 chars), email format if provided
   */
  static create(id: string, props: CreateOrganizationProps): OrganizationEntity {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Organization name must be at least 2 characters');
    }
    if (props.email && !OrganizationEntity.isValidEmail(props.email)) {
      throw new Error('Invalid email format');
    }

    const org = new OrganizationEntity();
    org._id = id;
    org._name = props.name.trim();
    org._tenantId = props.tenantId ?? '';
    org._website = props.website?.trim();
    org._email = props.email?.trim().toLowerCase();
    org._phone = props.phone?.trim();
    org._gstNumber = props.gstNumber?.trim().toUpperCase();
    org._address = props.address?.trim();
    org._city = props.city?.trim();
    org._state = props.state?.trim();
    org._country = props.country?.trim();
    org._pincode = props.pincode?.trim();
    org._industry = props.industry?.trim();
    org._annualRevenue = props.annualRevenue ?? undefined;
    org._notes = props.notes?.trim();
    org._isActive = true;
    org._createdById = props.createdById;
    org._isDeleted = false;
    org._deletedAt = null;
    org._deletedById = null;
    org._createdAt = new Date();
    org._updatedAt = new Date();

    org.addDomainEvent(
      new OrganizationCreatedEvent(id, org._name, org._industry, props.createdById),
    );
    return org;
  }

  /**
   * Reconstitute from persistence (DB ? Domain)
   */
  static fromPersistence(data: any): OrganizationEntity {
    const org = new OrganizationEntity();
    org._id = data.id;
    org._name = data.name;
    org._tenantId = data.tenantId ?? '';
    org._website = data.website ?? undefined;
    org._email = data.email ?? undefined;
    org._phone = data.phone ?? undefined;
    org._gstNumber = data.gstNumber ?? undefined;
    org._address = data.address ?? undefined;
    org._city = data.city ?? undefined;
    org._state = data.state ?? undefined;
    org._country = data.country ?? undefined;
    org._pincode = data.pincode ?? undefined;
    org._industry = data.industry ?? undefined;
    org._annualRevenue = data.annualRevenue ?? undefined;
    org._notes = data.notes ?? undefined;
    org._isActive = data.isActive ?? true;
    org._createdById = data.createdById;
    org._isDeleted = data.isDeleted ?? false;
    org._deletedAt = data.deletedAt ?? null;
    org._deletedById = data.deletedById ?? null;
    org._createdAt = data.createdAt;
    org._updatedAt = data.updatedAt;
    return org;
  }

  /**
