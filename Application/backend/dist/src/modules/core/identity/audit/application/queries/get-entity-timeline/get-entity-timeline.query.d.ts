export declare class GetEntityTimelineQuery {
    readonly entityType: string;
    readonly entityId: string;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    readonly action?: string | undefined;
    readonly dateFrom?: Date | undefined;
    readonly dateTo?: Date | undefined;
    constructor(entityType: string, entityId: string, page?: number | undefined, limit?: number | undefined, action?: string | undefined, dateFrom?: Date | undefined, dateTo?: Date | undefined);
}
