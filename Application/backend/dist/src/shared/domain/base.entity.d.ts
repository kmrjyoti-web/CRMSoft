export declare abstract class BaseEntity {
    protected readonly _id: string;
    protected _createdAt: Date;
    protected _updatedAt: Date;
    constructor(id: string);
    get id(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    equals(other: BaseEntity): boolean;
}
