import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';

export interface CreateActivityProps {
  type: string;
  subject: string;
  description?: string;
  scheduledAt?: Date;
  endTime?: Date;
  duration?: number;
  leadId?: string;
  contactId?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  createdById: string;
}

/**
 * Activity Aggregate Root.
 * Contains business rules for activity lifecycle.
 * No framework imports — pure domain logic.
 */
export class ActivityEntity extends AggregateRoot {
  private _type: string;
  private _subject: string;
  private _description?: string;
  private _outcome?: string;
  private _duration?: number;
  private _scheduledAt?: Date;
  private _endTime?: Date;
  private _completedAt?: Date;
  private _latitude?: number;
  private _longitude?: number;
  private _locationName?: string;
  private _leadId?: string;
  private _contactId?: string;
  private _isActive: boolean;
  private _isDeleted: boolean;
  private _deletedAt: Date | null;
  private _deletedById: string | null;
  private _createdById: string;

  /** Factory: Create new activity. */
  static create(id: string, props: CreateActivityProps): ActivityEntity {
    const activity = new ActivityEntity();
    activity._id = id;
    activity._type = props.type;
    activity._subject = props.subject;
    activity._description = props.description;
    activity._scheduledAt = props.scheduledAt;
    activity._endTime = props.endTime;
    activity._duration = props.duration;
    activity._leadId = props.leadId;
    activity._contactId = props.contactId;
    activity._locationName = props.locationName;
    activity._latitude = props.latitude;
    activity._longitude = props.longitude;
    activity._isActive = true;
    activity._isDeleted = false;
    activity._deletedAt = null;
    activity._deletedById = null;
    activity._createdById = props.createdById;
    activity._createdAt = new Date();
    activity._updatedAt = new Date();
    return activity;
  }

  /** Reconstitute from DB — no events emitted. */
  static fromPersistence(data: any): ActivityEntity {
    const activity = new ActivityEntity();
    activity._id = data.id;
    activity._type = data.type;
    activity._subject = data.subject;
    activity._description = data.description ?? undefined;
    activity._outcome = data.outcome ?? undefined;
    activity._duration = data.duration ?? undefined;
    activity._scheduledAt = data.scheduledAt ?? undefined;
    activity._endTime = data.endTime ?? undefined;
    activity._completedAt = data.completedAt ?? undefined;
    activity._latitude = data.latitude != null ? Number(data.latitude) : undefined;
    activity._longitude = data.longitude != null ? Number(data.longitude) : undefined;
    activity._locationName = data.locationName ?? undefined;
    activity._leadId = data.leadId ?? undefined;
    activity._contactId = data.contactId ?? undefined;
    activity._isActive = data.isActive ?? true;
    activity._isDeleted = data.isDeleted ?? false;
    activity._deletedAt = data.deletedAt ?? null;
    activity._deletedById = data.deletedById ?? null;
    activity._createdById = data.createdById;
    activity._createdAt = data.createdAt;
    activity._updatedAt = data.updatedAt;
    return activity;
  }

  /** Complete the activity with an outcome. */
  complete(outcome: string): void {
    this._outcome = outcome;
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  /** Update activity details. */
  updateDetails(data: {
    subject?: string;
    description?: string;
    scheduledAt?: Date;
    endTime?: Date;
    duration?: number;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  }): void {
    if (data.subject !== undefined) this._subject = data.subject;
    if (data.description !== undefined) this._description = data.description;
    if (data.scheduledAt !== undefined) this._scheduledAt = data.scheduledAt;
    if (data.endTime !== undefined) this._endTime = data.endTime;
    if (data.duration !== undefined) this._duration = data.duration;
    if (data.locationName !== undefined) this._locationName = data.locationName;
    if (data.latitude !== undefined) this._latitude = data.latitude;
    if (data.longitude !== undefined) this._longitude = data.longitude;
    this._updatedAt = new Date();
  }

  /**
   * Soft delete — mark as deleted without removing from persistence
   */
  softDelete(deletedById: string): void {
    if (this._isDeleted) {
      throw new Error('Activity is already deleted');
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
      throw new Error('Activity is not deleted');
    }
    this._isDeleted = false;
    this._isActive = true;
    this._deletedAt = null;
    this._deletedById = null;
    this._updatedAt = new Date();
  }

  // --- Getters (read-only access to state) ---
  get type(): string { return this._type; }
  get subject(): string { return this._subject; }
  get description(): string | undefined { return this._description; }
  get outcome(): string | undefined { return this._outcome; }
  get duration(): number | undefined { return this._duration; }
  get scheduledAt(): Date | undefined { return this._scheduledAt; }
  get endTime(): Date | undefined { return this._endTime; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get latitude(): number | undefined { return this._latitude; }
  get longitude(): number | undefined { return this._longitude; }
  get locationName(): string | undefined { return this._locationName; }
  get leadId(): string | undefined { return this._leadId; }
  get contactId(): string | undefined { return this._contactId; }
  get isActive(): boolean { return this._isActive; }
  get isDeleted(): boolean { return this._isDeleted; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get deletedById(): string | null { return this._deletedById; }
  get createdById(): string { return this._createdById; }
}
