export declare class GetRequirementQuotesQuery {
    readonly requirementId: string;
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    constructor(requirementId: string, tenantId: string, page?: number, limit?: number);
}
