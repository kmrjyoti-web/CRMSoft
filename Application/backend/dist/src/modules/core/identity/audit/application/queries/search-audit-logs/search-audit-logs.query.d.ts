export declare class SearchAuditLogsQuery {
    readonly q?: string | undefined;
    readonly entityType?: string | undefined;
    readonly action?: string | undefined;
    readonly userId?: string | undefined;
    readonly dateFrom?: Date | undefined;
    readonly dateTo?: Date | undefined;
    readonly field?: string | undefined;
    readonly module?: string | undefined;
    readonly sensitive?: boolean | undefined;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    constructor(q?: string | undefined, entityType?: string | undefined, action?: string | undefined, userId?: string | undefined, dateFrom?: Date | undefined, dateTo?: Date | undefined, field?: string | undefined, module?: string | undefined, sensitive?: boolean | undefined, page?: number | undefined, limit?: number | undefined);
}
