import { Injectable } from '@nestjs/common';

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

@Injectable()
export class FeedRankerService {
  score(item: RankableItem, userCtx: UserContext): number {
    return (
      this.recencyScore(item.createdAt) +
      this.engagementScore(item) +
      this.relevanceScore(item, userCtx) +
      this.boostScore(item)
    );
  }

  rank(items: RankableItem[], userCtx: UserContext): RankableItem[] {
    return items
      .map(item => ({ item, score: this.score(item, userCtx) }))
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }

  recencyScore(createdAt: Date): number {
    const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    if (ageHours < 1) return 1.0;
    if (ageHours < 6) return 0.8;
    if (ageHours < 24) return 0.5;
    if (ageHours < 168) return 0.2;
    return 0.05;
  }

  engagementScore(item: RankableItem): number {
    if (!item.viewCount || item.viewCount === 0) return 0;
    const engagement =
      (item.likeCount ?? 0) +
      (item.commentCount ?? 0) * 2 +
      (item.shareCount ?? 0) * 3;
    return Math.min(engagement / item.viewCount, 1.0);
  }

  relevanceScore(item: RankableItem, ctx: UserContext): number {
    let score = 0;
    if (item.categoryId && ctx.interactedCategoryIds.includes(item.categoryId)) {
      score += 0.3;
    }
    if (item.city && ctx.city && item.city === ctx.city) score += 0.2;
    if (item.state && ctx.state && item.state === ctx.state) score += 0.1;
    if (item.authorId && ctx.followingIds.includes(item.authorId)) score += 0.3;
    return score;
  }

  boostScore(item: RankableItem): number {
    let score = 0;
    if (item.isFeatured) score += 0.5;
    if (item.hasActiveOffer) score += 0.3;
    if (item.postType === 'PRODUCT_LAUNCH') score += 0.2;
    return score;
  }
}
