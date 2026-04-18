export declare class ListScheduledTestRunsQuery {
    readonly scheduledTestId: string;
    readonly tenantId: string;
    readonly limit?: number | undefined;
    constructor(scheduledTestId: string, tenantId: string, limit?: number | undefined);
}
