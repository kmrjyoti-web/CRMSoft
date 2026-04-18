export declare class GetQuotationAnalyticsQuery {
    readonly type: 'overview' | 'conversion';
    readonly dateFrom?: Date | undefined;
    readonly dateTo?: Date | undefined;
    readonly userId?: string | undefined;
    constructor(type: 'overview' | 'conversion', dateFrom?: Date | undefined, dateTo?: Date | undefined, userId?: string | undefined);
}
