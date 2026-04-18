import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { CommunicationType } from '../../../../../shared/domain/value-objects/communication-type.vo';
import { PriorityType } from '../../../../../shared/domain/value-objects/priority-type.vo';
export interface CreateCommunicationProps {
    type: string;
    value: string;
    priorityType?: string;
    isPrimary?: boolean;
    label?: string;
    rawContactId?: string;
    contactId?: string;
    organizationId?: string;
    leadId?: string;
    notes?: string;
}
export declare class CommunicationEntity extends AggregateRoot {
    private _type;
    private _value;
    private _priorityType;
    private _isPrimary;
    private _isVerified;
    private _label?;
    private _rawContactId?;
    private _contactId?;
    private _organizationId?;
    private _leadId?;
    private _notes?;
    static create(id: string, props: CreateCommunicationProps): CommunicationEntity;
    static fromPersistence(data: any): CommunicationEntity;
    linkToContact(contactId: string): void;
    linkToOrganization(organizationId: string): void;
    linkToLead(leadId: string): void;
    markVerified(): void;
    changePriority(newPriority: string): void;
    setAsPrimary(): void;
    unsetPrimary(): void;
    get type(): CommunicationType;
    get value(): string;
    get priorityType(): PriorityType;
    get isPrimary(): boolean;
    get isVerified(): boolean;
    get label(): string | undefined;
    get rawContactId(): string | undefined;
    get contactId(): string | undefined;
    get organizationId(): string | undefined;
    get leadId(): string | undefined;
    get notes(): string | undefined;
}
