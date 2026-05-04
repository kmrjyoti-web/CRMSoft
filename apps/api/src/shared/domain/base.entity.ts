/**
 * Base Entity - All domain entities extend this.
 * Entities have identity (UUID) and lifecycle.
 */
export abstract class BaseEntity {
  protected readonly _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: string) {
    if (!id) throw new Error('Entity ID is required');
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  equals(other: BaseEntity): boolean {
    if (!other) return false;
    return this._id === other._id;
  }
}

