import { AggregateRoot } from '../../../../shared/domain/aggregate-root';

export interface CreateUserProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  status?: string;
  userType?: string;
  roleId: string;
  departmentId?: string;
  designationId?: string;
  reportingToId?: string;
  employeeCode?: string;
  joiningDate?: Date;
  createdBy?: string;
}

/**
 * User Aggregate Root.
 * Uses status enum (ACTIVE, INACTIVE, SUSPENDED) instead of isActive boolean.
 * Contains business rules for user lifecycle.
 * No framework imports — pure domain logic.
 */
export class UserEntity extends AggregateRoot {
  private _email: string;
  private _password: string;
  private _firstName: string;
  private _lastName: string;
  private _phone?: string;
  private _avatar?: string;
  private _status: string;
  private _userType: string;
  private _lastLoginAt?: Date;
  private _roleId: string;
  private _departmentId?: string;
  private _designationId?: string;
  private _reportingToId?: string;
  private _employeeCode?: string;
  private _joiningDate?: Date;
  private _isDeleted: boolean;
  private _deletedAt: Date | null;
  private _deletedById: string | null;
  private _createdBy?: string;

  /** Factory: Create new user. */
  static create(id: string, props: CreateUserProps): UserEntity {
    const user = new UserEntity();
    user._id = id;
    user._email = props.email;
    user._password = props.password;
    user._firstName = props.firstName;
    user._lastName = props.lastName;
    user._phone = props.phone;
    user._avatar = props.avatar;
    user._status = props.status || 'ACTIVE';
    user._userType = props.userType || 'EMPLOYEE';
    user._roleId = props.roleId;
    user._departmentId = props.departmentId;
    user._designationId = props.designationId;
    user._reportingToId = props.reportingToId;
    user._employeeCode = props.employeeCode;
    user._joiningDate = props.joiningDate;
    user._isDeleted = false;
    user._deletedAt = null;
    user._deletedById = null;
    user._createdBy = props.createdBy;
    user._createdAt = new Date();
    user._updatedAt = new Date();
    return user;
  }

  /** Reconstitute from DB — no events emitted. */
  static fromPersistence(data: any): UserEntity {
    const user = new UserEntity();
    user._id = data.id;
    user._email = data.email;
    user._password = data.password;
    user._firstName = data.firstName;
    user._lastName = data.lastName;
    user._phone = data.phone ?? undefined;
    user._avatar = data.avatar ?? undefined;
    user._status = data.status;
    user._userType = data.userType;
    user._lastLoginAt = data.lastLoginAt ?? undefined;
    user._roleId = data.roleId;
    user._departmentId = data.departmentId ?? undefined;
    user._designationId = data.designationId ?? undefined;
    user._reportingToId = data.reportingToId ?? undefined;
    user._employeeCode = data.employeeCode ?? undefined;
    user._joiningDate = data.joiningDate ?? undefined;
    user._isDeleted = data.isDeleted ?? false;
    user._deletedAt = data.deletedAt ?? null;
    user._deletedById = data.deletedById ?? null;
    user._createdBy = data.createdBy ?? undefined;
    user._createdAt = data.createdAt;
    user._updatedAt = data.updatedAt;
    return user;
  }

  /**
   * Soft delete — mark as deleted without removing from persistence
   */
  softDelete(deletedById: string): void {
    if (this._isDeleted) {
      throw new Error('User is already deleted');
    }
    this._isDeleted = true;
    this._deletedAt = new Date();
    this._deletedById = deletedById;
    this._updatedAt = new Date();
  }

  /**
   * Restore — reverse a soft delete
   */
  restore(): void {
    if (!this._isDeleted) {
      throw new Error('User is not deleted');
    }
    this._isDeleted = false;
    this._deletedAt = null;
    this._deletedById = null;
    this._updatedAt = new Date();
  }

  // ─── Getters (read-only access to state) ───
  get email(): string { return this._email; }
  get password(): string { return this._password; }
  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get fullName(): string { return `${this._firstName} ${this._lastName}`; }
  get phone(): string | undefined { return this._phone; }
  get avatar(): string | undefined { return this._avatar; }
  get status(): string { return this._status; }
  get userType(): string { return this._userType; }
  get lastLoginAt(): Date | undefined { return this._lastLoginAt; }
  get roleId(): string { return this._roleId; }
  get departmentId(): string | undefined { return this._departmentId; }
  get designationId(): string | undefined { return this._designationId; }
  get reportingToId(): string | undefined { return this._reportingToId; }
  get employeeCode(): string | undefined { return this._employeeCode; }
  get joiningDate(): Date | undefined { return this._joiningDate; }
  get isDeleted(): boolean { return this._isDeleted; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get deletedById(): string | null { return this._deletedById; }
  get createdBy(): string | undefined { return this._createdBy; }
}
