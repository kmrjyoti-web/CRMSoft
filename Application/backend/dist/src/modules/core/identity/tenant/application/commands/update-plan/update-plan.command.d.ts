export declare class UpdatePlanCommand {
    readonly planId: string;
    readonly name?: string | undefined;
    readonly description?: string | undefined;
    readonly price?: number | undefined;
    readonly maxUsers?: number | undefined;
    readonly maxContacts?: number | undefined;
    readonly maxLeads?: number | undefined;
    readonly maxProducts?: number | undefined;
    readonly maxStorage?: number | undefined;
    readonly features?: string[] | undefined;
    readonly isActive?: boolean | undefined;
    readonly sortOrder?: number | undefined;
    constructor(planId: string, name?: string | undefined, description?: string | undefined, price?: number | undefined, maxUsers?: number | undefined, maxContacts?: number | undefined, maxLeads?: number | undefined, maxProducts?: number | undefined, maxStorage?: number | undefined, features?: string[] | undefined, isActive?: boolean | undefined, sortOrder?: number | undefined);
}
