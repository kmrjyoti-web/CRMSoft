export declare class GetTaskListQuery {
    readonly userId: string;
    readonly roleLevel: number;
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    readonly priority?: string | undefined;
    readonly assignedToId?: string | undefined;
    readonly search?: string | undefined;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    constructor(userId: string, roleLevel: number, tenantId: string, page?: number, limit?: number, status?: string | undefined, priority?: string | undefined, assignedToId?: string | undefined, search?: string | undefined, sortBy?: string, sortOrder?: 'asc' | 'desc');
}
