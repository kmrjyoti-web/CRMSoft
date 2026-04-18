export declare class GetTestResultsQuery {
    readonly testRunId: string;
    readonly filters: {
        testType?: string;
        status?: string;
        module?: string;
        page?: number;
        limit?: number;
    };
    constructor(testRunId: string, filters: {
        testType?: string;
        status?: string;
        module?: string;
        page?: number;
        limit?: number;
    });
}
