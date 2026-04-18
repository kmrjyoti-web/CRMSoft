export declare class ContactCommunicationDto {
    type: string;
    value: string;
    priorityType?: string;
    label?: string;
    isPrimary?: boolean;
}
export declare class CreateContactDto {
    firstName: string;
    lastName: string;
    designation?: string;
    department?: string;
    notes?: string;
    communications?: ContactCommunicationDto[];
    organizationId?: string;
    orgRelationType?: string;
    filterIds?: string[];
}
