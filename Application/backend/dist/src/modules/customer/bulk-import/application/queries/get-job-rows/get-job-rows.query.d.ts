export declare class GetJobRowsQuery {
    readonly jobId: string;
    readonly status?: string | undefined;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    constructor(jobId: string, status?: string | undefined, page?: number | undefined, limit?: number | undefined);
}
