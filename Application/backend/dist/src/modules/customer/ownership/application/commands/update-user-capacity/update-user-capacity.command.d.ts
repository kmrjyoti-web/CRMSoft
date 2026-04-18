export declare class UpdateUserCapacityCommand {
    readonly userId: string;
    readonly data: {
        maxLeads?: number;
        maxContacts?: number;
        maxOrganizations?: number;
        maxQuotations?: number;
        maxTotal?: number;
    };
    constructor(userId: string, data: {
        maxLeads?: number;
        maxContacts?: number;
        maxOrganizations?: number;
        maxQuotations?: number;
        maxTotal?: number;
    });
}
