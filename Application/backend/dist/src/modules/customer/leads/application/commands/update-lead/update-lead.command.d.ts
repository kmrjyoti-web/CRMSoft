export declare class UpdateLeadCommand {
    readonly leadId: string;
    readonly data: {
        priority?: string;
        expectedValue?: number;
        expectedCloseDate?: Date;
        notes?: string;
    };
    readonly filterIds?: string[] | undefined;
    constructor(leadId: string, data: {
        priority?: string;
        expectedValue?: number;
        expectedCloseDate?: Date;
        notes?: string;
    }, filterIds?: string[] | undefined);
}
