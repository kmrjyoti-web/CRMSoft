export declare class ListManualTestLogsQuery {
    readonly tenantId: string;
    readonly filters: {
        testRunId?: string;
        module?: string;
        status?: string;
        userId?: string;
        page?: number;
        limit?: number;
    };
    constructor(tenantId: string, filters: {
        testRunId?: string;
        module?: string;
        status?: string;
        userId?: string;
        page?: number;
        limit?: number;
    });
}
