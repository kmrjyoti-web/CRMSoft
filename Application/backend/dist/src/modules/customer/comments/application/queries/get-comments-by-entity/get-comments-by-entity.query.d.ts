export declare class GetCommentsByEntityQuery {
    readonly entityType: string;
    readonly entityId: string;
    readonly userId: string;
    readonly roleLevel: number;
    readonly page: number;
    readonly limit: number;
    constructor(entityType: string, entityId: string, userId: string, roleLevel: number, page?: number, limit?: number);
}
