export declare class GetFieldHistoryQuery {
    readonly entityType: string;
    readonly entityId: string;
    readonly fieldName: string;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    constructor(entityType: string, entityId: string, fieldName: string, page?: number | undefined, limit?: number | undefined);
}
