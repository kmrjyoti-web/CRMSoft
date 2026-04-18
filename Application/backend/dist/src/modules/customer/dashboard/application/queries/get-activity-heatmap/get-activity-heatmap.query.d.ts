export declare class GetActivityHeatmapQuery {
    readonly dateFrom: Date;
    readonly dateTo: Date;
    readonly userId?: string | undefined;
    readonly activityType?: string | undefined;
    constructor(dateFrom: Date, dateTo: Date, userId?: string | undefined, activityType?: string | undefined);
}
