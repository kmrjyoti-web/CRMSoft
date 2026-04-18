export declare class GetRevenueAnalyticsQuery {
    readonly dateFrom: Date;
    readonly dateTo: Date;
    readonly groupBy?: string | undefined;
    constructor(dateFrom: Date, dateTo: Date, groupBy?: string | undefined);
}
