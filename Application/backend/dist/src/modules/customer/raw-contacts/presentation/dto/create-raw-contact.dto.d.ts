export declare class CommunicationItemDto {
    type: string;
    value: string;
    priorityType?: string;
    label?: string;
}
export declare class CreateRawContactDto {
    firstName: string;
    lastName: string;
    source?: string;
    companyName?: string;
    designation?: string;
    department?: string;
    notes?: string;
    communications?: CommunicationItemDto[];
    filterIds?: string[];
}
