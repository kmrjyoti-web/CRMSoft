export declare class GetRankedFeedQuery {
    readonly tenantId: string;
    readonly userId: string;
    readonly page: number;
    readonly limit: number;
    readonly category?: string | undefined;
    readonly city?: string | undefined;
    readonly feedType: 'main' | 'following' | 'trending' | 'discover';
    constructor(tenantId: string, userId: string, page?: number, limit?: number, category?: string | undefined, city?: string | undefined, feedType?: 'main' | 'following' | 'trending' | 'discover');
}
