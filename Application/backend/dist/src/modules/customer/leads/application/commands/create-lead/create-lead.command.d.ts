export declare class CreateLeadCommand {
    readonly contactId: string;
    readonly createdById: string;
    readonly organizationId?: string | undefined;
    readonly priority?: string | undefined;
    readonly expectedValue?: number | undefined;
    readonly expectedCloseDate?: Date | undefined;
    readonly notes?: string | undefined;
    readonly filterIds?: string[] | undefined;
    constructor(contactId: string, createdById: string, organizationId?: string | undefined, priority?: string | undefined, expectedValue?: number | undefined, expectedCloseDate?: Date | undefined, notes?: string | undefined, filterIds?: string[] | undefined);
}
