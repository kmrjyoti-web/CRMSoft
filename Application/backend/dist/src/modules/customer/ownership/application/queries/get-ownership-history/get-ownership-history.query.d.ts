export declare class GetOwnershipHistoryQuery {
    readonly entityType: string;
    readonly entityId: string;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    constructor(entityType: string, entityId: string, page?: number | undefined, limit?: number | undefined);
}
