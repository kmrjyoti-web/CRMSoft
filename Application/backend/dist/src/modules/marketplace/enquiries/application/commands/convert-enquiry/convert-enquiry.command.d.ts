export declare class ConvertEnquiryCommand {
    readonly enquiryId: string;
    readonly tenantId: string;
    readonly convertedById: string;
    readonly crmLeadId?: string | undefined;
    constructor(enquiryId: string, tenantId: string, convertedById: string, crmLeadId?: string | undefined);
}
