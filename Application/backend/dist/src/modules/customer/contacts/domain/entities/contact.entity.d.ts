import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
export interface CreateContactProps {
    firstName: string;
    lastName: string;
    designation?: string;
    department?: string;
    notes?: string;
    createdById: string;
}
export interface UpdateContactProps {
    firstName?: string;
    lastName?: string;
    designation?: string;
    department?: string;
    notes?: string;
}
export declare class ContactEntity extends AggregateRoot {
    private _firstName;
    private _lastName;
    private _designation?;
    private _department?;
    private _notes?;
    private _isActive;
    private _isDeleted;
    private _deletedAt;
    private _deletedById;
    private _createdById;
    static create(id: string, props: CreateContactProps): ContactEntity;
    static fromPersistence(data: any): ContactEntity;
    updateDetails(data: UpdateContactProps, updatedById: string): void;
    deactivate(): void;
    reactivate(): void;
    softDelete(deletedById: string): void;
    restore(): void;
    get fullName(): string;
    get firstName(): string;
    get lastName(): string;
    get designation(): string | undefined;
    get department(): string | undefined;
    get notes(): string | undefined;
    get isActive(): boolean;
    get isDeleted(): boolean;
    get deletedAt(): Date | null;
    get deletedById(): string | null;
    get createdById(): string;
}
