export declare class GetFollowUpListQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly priority?: string | undefined;
    readonly assignedToId?: string | undefined;
    readonly isOverdue?: boolean | undefined;
    readonly entityType?: string | undefined;
    readonly entityId?: string | undefined;
    constructor(page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string | undefined, priority?: string | undefined, assignedToId?: string | undefined, isOverdue?: boolean | undefined, entityType?: string | undefined, entityId?: string | undefined);
}
