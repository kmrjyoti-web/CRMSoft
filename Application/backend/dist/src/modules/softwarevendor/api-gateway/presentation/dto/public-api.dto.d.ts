export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
}
export declare class CreateLeadDto {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    statusId?: string;
    assignedToId?: string;
    estimatedValue?: number;
    customFields?: Record<string, any>;
}
export declare class UpdateLeadDto {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    statusId?: string;
    assignedToId?: string;
    estimatedValue?: number;
    customFields?: Record<string, any>;
}
export declare class CreateContactDto {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    organizationId?: string;
    designation?: string;
    customFields?: Record<string, any>;
}
export declare class UpdateContactDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    organizationId?: string;
    designation?: string;
    customFields?: Record<string, any>;
}
export declare class CreateOrganizationDto {
    name: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    customFields?: Record<string, any>;
}
export declare class UpdateOrganizationDto {
    name?: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    customFields?: Record<string, any>;
}
export declare class CreateActivityDto {
    type: string;
    subject: string;
    description?: string;
    leadId?: string;
    contactId?: string;
    organizationId?: string;
    assignedToId?: string;
    dueDate?: string;
}
