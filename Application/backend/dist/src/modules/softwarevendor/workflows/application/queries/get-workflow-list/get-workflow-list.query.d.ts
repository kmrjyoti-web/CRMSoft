export declare class GetWorkflowListQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortOrder: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly entityType?: string | undefined;
    constructor(page: number, limit: number, sortOrder: 'asc' | 'desc', search?: string | undefined, entityType?: string | undefined);
}
