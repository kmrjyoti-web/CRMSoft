export declare class GetSalesFunnelQuery {
    readonly dateFrom: Date;
    readonly dateTo: Date;
    readonly userId?: string | undefined;
    readonly source?: string | undefined;
    constructor(dateFrom: Date, dateTo: Date, userId?: string | undefined, source?: string | undefined);
}
