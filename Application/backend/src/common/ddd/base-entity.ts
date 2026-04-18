/**
 * BaseEntity — root of all DDD domain entities.
 *
 * Rules:
 *  - Entities have private/protected constructors; use static factory methods.
 *  - Business validation lives INSIDE the entity.
 *  - No Prisma decorators — mapping happens in infrastructure layer.
 */
export abstract class BaseEntity<TProps> {
  protected readonly _id: string;
  protected readonly _tenantId: string;
  protected props: TProps;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  protected constructor(id: string, tenantId: string, props: TProps) {
    this._id = id;
    this._tenantId = tenantId;
    this.props = props;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get tenantId(): string {
    return this._tenantId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** Set from persisted values (infrastructure mapper). */
  protected setTimestamps(createdAt: Date, updatedAt: Date): void {
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  equals(other: BaseEntity<unknown>): boolean {
    return this._id === other._id && this._tenantId === other._tenantId;
  }
}
