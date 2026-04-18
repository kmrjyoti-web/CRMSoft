export declare class UpdateOrganizationCommand {
    readonly organizationId: string;
    readonly data: {
        name?: string;
        website?: string;
        email?: string;
        phone?: string;
        gstNumber?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
        industry?: string;
        annualRevenue?: number;
        notes?: string;
    };
    readonly filterIds?: string[] | undefined;
    constructor(organizationId: string, data: {
        name?: string;
        website?: string;
        email?: string;
        phone?: string;
        gstNumber?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
        industry?: string;
        annualRevenue?: number;
        notes?: string;
    }, filterIds?: string[] | undefined);
}
