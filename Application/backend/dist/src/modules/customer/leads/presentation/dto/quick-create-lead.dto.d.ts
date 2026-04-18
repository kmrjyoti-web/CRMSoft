export declare class InlineContactDto {
    firstName: string;
    lastName: string;
    mobile: string;
}
export declare class InlineOrganizationDto {
    name: string;
}
export declare class QuickCreateLeadDto {
    contactId?: string;
    inlineContact?: InlineContactDto;
    organizationId?: string;
    inlineOrganization?: InlineOrganizationDto;
    priority?: string;
    expectedValue?: number;
    expectedCloseDate?: string;
    notes?: string;
    filterIds?: string[];
}
