export declare class CreatePlanCommand {
    readonly name: string;
    readonly code: string;
    readonly interval: string;
    readonly price: number;
    readonly maxUsers: number;
    readonly maxContacts: number;
    readonly maxLeads: number;
    readonly maxProducts: number;
    readonly maxStorage: number;
    readonly features: string[];
    readonly description?: string | undefined;
    readonly currency?: string | undefined;
    readonly isActive?: boolean | undefined;
    readonly sortOrder?: number | undefined;
    constructor(name: string, code: string, interval: string, price: number, maxUsers: number, maxContacts: number, maxLeads: number, maxProducts: number, maxStorage: number, features: string[], description?: string | undefined, currency?: string | undefined, isActive?: boolean | undefined, sortOrder?: number | undefined);
}
