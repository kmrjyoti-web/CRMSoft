export declare class GetEligibleEntitiesQuery {
    readonly tenantId: string;
    readonly entityType?: string | undefined;
    readonly search?: string | undefined;
    readonly page: number;
    readonly limit: number;
    constructor(tenantId: string, entityType?: string | undefined, search?: string | undefined, page?: number, limit?: number);
}
