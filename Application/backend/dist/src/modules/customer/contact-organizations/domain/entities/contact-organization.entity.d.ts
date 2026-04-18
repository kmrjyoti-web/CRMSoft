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
export declare class ContactOrganizationEntity extends AggregateRoot {
    private _contactId;
    private _organizationId;
    private _relationType;
    private _isPrimary;
    private _designation?;
    private _department?;
    private _startDate?;
    private _endDate?;
    private _isActive;
    private _notes?;
    static create(id: string, props: CreateContactOrgProps): ContactOrganizationEntity;
    static fromPersistence(data: any): ContactOrganizationEntity;
    setAsPrimary(): void;
    unsetPrimary(): void;
    deactivate(endDate?: Date): void;
    reactivate(): void;
    changeRelationType(newType: string): void;
    get contactId(): string;
    get organizationId(): string;
    get relationType(): ContactOrgRelation;
    get isPrimary(): boolean;
    get designation(): string | undefined;
    get department(): string | undefined;
    get startDate(): Date | undefined;
    get endDate(): Date | undefined;
    get isActive(): boolean;
    get notes(): string | undefined;
}
