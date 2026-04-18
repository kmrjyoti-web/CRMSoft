export declare class GetFeedQuery {
    readonly tenantId: string;
    readonly userId: string;
    readonly page: number;
    readonly limit: number;
    readonly postType?: string | undefined;
    readonly authorId?: string | undefined;
    constructor(tenantId: string, userId: string, page?: number, limit?: number, postType?: string | undefined, authorId?: string | undefined);
}
