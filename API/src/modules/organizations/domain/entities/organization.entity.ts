import { AggregateRoot } from '../../../../shared/domain/aggregate-root';
import { OrganizationCreatedEvent } from '../events/organization-created.event';
import { OrganizationUpdatedEvent } from '../events/organization-updated.event';
import { OrganizationDeactivatedEvent } from '../events/organization-deactivated.event';

export interface CreateOrganizationProps {
  name: string;
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
   * Reconstitute from persistence (DB → Domain)
   */
  static fromPersistence(data: any): OrganizationEntity {
    const org = new OrganizationEntity();
    org._id = data.id;
    org._name = data.name;
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
   * Update details — only active organizations can be updated
   */
  updateDetails(data: UpdateOrganizationProps): void {
    if (!this._isActive) {
      throw new Error('Cannot update deactivated organization');
    }
    if (data.name !== undefined) {
      if (data.name.trim().length < 2) {
        throw new Error('Organization name must be at least 2 characters');
      }
      this._name = data.name.trim();
    }
    if (data.email !== undefined) {
      if (data.email && !OrganizationEntity.isValidEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      this._email = data.email?.trim().toLowerCase();
    }
    if (data.website !== undefined) this._website = data.website?.trim();
    if (data.phone !== undefined) this._phone = data.phone?.trim();
    if (data.gstNumber !== undefined) this._gstNumber = data.gstNumber?.trim().toUpperCase();
    if (data.address !== undefined) this._address = data.address?.trim();
    if (data.city !== undefined) this._city = data.city?.trim();
    if (data.state !== undefined) this._state = data.state?.trim();
    if (data.country !== undefined) this._country = data.country?.trim();
    if (data.pincode !== undefined) this._pincode = data.pincode?.trim();
    if (data.industry !== undefined) this._industry = data.industry?.trim();
    if (data.annualRevenue !== undefined) this._annualRevenue = data.annualRevenue ?? undefined;
    if (data.notes !== undefined) this._notes = data.notes?.trim();
    this._updatedAt = new Date();

    this.addDomainEvent(new OrganizationUpdatedEvent(this._id, this._name));
  }

  /**
   * Deactivate — soft delete. Cannot deactivate already inactive org.
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new Error('Organization is already deactivated');
    }
    this._isActive = false;
    this._updatedAt = new Date();
    this.addDomainEvent(new OrganizationDeactivatedEvent(this._id, this._name));
  }

  /**
   * Reactivate — bring back from deactivated state.
   */
  reactivate(): void {
    if (this._isActive) {
      throw new Error('Organization is already active');
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Soft delete — mark as deleted without removing from DB.
   */
  softDelete(deletedById: string): void {
    if (this._isDeleted) {
      throw new Error('Organization is already deleted');
    }
    this._isDeleted = true;
    this._isActive = false;
    this._deletedAt = new Date();
    this._deletedById = deletedById;
    this._updatedAt = new Date();
  }

  /**
   * Restore — bring back from soft-deleted state.
   */
  restore(): void {
    if (!this._isDeleted) {
      throw new Error('Organization is not deleted');
    }
    this._isDeleted = false;
    this._isActive = true;
    this._deletedAt = null;
    this._deletedById = null;
    this._updatedAt = new Date();
  }

  // ─── Getters ───
  get name(): string { return this._name; }
  get website(): string | undefined { return this._website; }
  get email(): string | undefined { return this._email; }
  get phone(): string | undefined { return this._phone; }
  get gstNumber(): string | undefined { return this._gstNumber; }
  get address(): string | undefined { return this._address; }
  get city(): string | undefined { return this._city; }
  get state(): string | undefined { return this._state; }
  get country(): string | undefined { return this._country; }
  get pincode(): string | undefined { return this._pincode; }
  get industry(): string | undefined { return this._industry; }
  get annualRevenue(): number | undefined { return this._annualRevenue; }
  get notes(): string | undefined { return this._notes; }
  get isActive(): boolean { return this._isActive; }
  get createdById(): string { return this._createdById; }
  get isDeleted(): boolean { return this._isDeleted; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get deletedById(): string | null { return this._deletedById; }

  // ─── Helpers ───
  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
