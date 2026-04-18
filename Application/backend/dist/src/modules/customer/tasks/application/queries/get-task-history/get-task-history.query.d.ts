export declare class GetTaskHistoryQuery {
    readonly taskId: string;
    readonly page: number;
    readonly limit: number;
    constructor(taskId: string, page?: number, limit?: number);
}
