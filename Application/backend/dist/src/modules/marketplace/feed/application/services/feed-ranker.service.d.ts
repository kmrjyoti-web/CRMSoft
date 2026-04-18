export interface RankableItem {
    id: string;
    type: 'POST' | 'LISTING' | 'OFFER';
    createdAt: Date;
    viewCount: number;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
    categoryId?: string;
    authorId?: string;
    city?: string;
    state?: string;
    isFeatured?: boolean;
    hasActiveOffer?: boolean;
    postType?: string;
}
export interface UserContext {
    userId: string;
    city?: string;
    state?: string;
    followingIds: string[];
    interactedCategoryIds: string[];
}
export declare class FeedRankerService {
    score(item: RankableItem, userCtx: UserContext): number;
    rank(items: RankableItem[], userCtx: UserContext): RankableItem[];
    recencyScore(createdAt: Date): number;
    engagementScore(item: RankableItem): number;
    relevanceScore(item: RankableItem, ctx: UserContext): number;
    boostScore(item: RankableItem): number;
}
