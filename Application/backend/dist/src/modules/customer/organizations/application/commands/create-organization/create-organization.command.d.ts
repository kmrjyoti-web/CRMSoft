export declare class CreateOrganizationCommand {
    readonly name: string;
    readonly createdById: string;
    readonly tenantId: string;
    readonly website?: string | undefined;
    readonly email?: string | undefined;
    readonly phone?: string | undefined;
    readonly gstNumber?: string | undefined;
    readonly address?: string | undefined;
    readonly city?: string | undefined;
    readonly state?: string | undefined;
    readonly country?: string | undefined;
    readonly pincode?: string | undefined;
    readonly industry?: string | undefined;
    readonly annualRevenue?: number | undefined;
    readonly notes?: string | undefined;
    readonly filterIds?: string[] | undefined;
    constructor(name: string, createdById: string, tenantId: string, website?: string | undefined, email?: string | undefined, phone?: string | undefined, gstNumber?: string | undefined, address?: string | undefined, city?: string | undefined, state?: string | undefined, country?: string | undefined, pincode?: string | undefined, industry?: string | undefined, annualRevenue?: number | undefined, notes?: string | undefined, filterIds?: string[] | undefined);
}
