import { ContactCommunicationDto } from './create-contact.dto';
export declare class UpdateContactDto {
    firstName?: string;
    lastName?: string;
    designation?: string;
    department?: string;
    notes?: string;
    communications?: ContactCommunicationDto[];
    organizationId?: string;
    filterIds?: string[];
}
