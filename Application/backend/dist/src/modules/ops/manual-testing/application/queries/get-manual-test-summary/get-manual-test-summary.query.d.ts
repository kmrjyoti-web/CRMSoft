export declare class GetManualTestSummaryQuery {
    readonly tenantId: string;
    readonly filters: {
        testRunId?: string;
        from?: string;
        to?: string;
    };
    constructor(tenantId: string, filters: {
        testRunId?: string;
        from?: string;
        to?: string;
    });
}
