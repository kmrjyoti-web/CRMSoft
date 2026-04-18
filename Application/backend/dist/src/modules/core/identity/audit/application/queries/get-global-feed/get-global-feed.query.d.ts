export declare class GetGlobalFeedQuery {
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    readonly entityType?: string | undefined;
    readonly action?: string | undefined;
    readonly dateFrom?: Date | undefined;
    readonly dateTo?: Date | undefined;
    constructor(page?: number | undefined, limit?: number | undefined, entityType?: string | undefined, action?: string | undefined, dateFrom?: Date | undefined, dateTo?: Date | undefined);
}
