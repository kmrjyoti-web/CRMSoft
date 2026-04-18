export declare abstract class BaseEntity<TProps> {
    protected readonly _id: string;
    protected readonly _tenantId: string;
    protected props: TProps;
    protected _createdAt: Date;
    protected _updatedAt: Date;
    protected constructor(id: string, tenantId: string, props: TProps);
    get id(): string;
    get tenantId(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    protected setTimestamps(createdAt: Date, updatedAt: Date): void;
    protected touch(): void;
    equals(other: BaseEntity<unknown>): boolean;
}
