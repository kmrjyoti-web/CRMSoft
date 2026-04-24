import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GetRankedFeedQuery } from './get-ranked-feed.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
import { FeedRankerService, RankableItem, UserContext } from '../../services/feed-ranker.service';

@QueryHandler(GetRankedFeedQuery)
@Injectable()
export class GetRankedFeedHandler implements IQueryHandler<GetRankedFeedQuery> {
    private readonly logger = new Logger(GetRankedFeedHandler.name);

  constructor(
    private readonly mktPrisma: MktPrismaService,
    private readonly ranker: FeedRankerService,
  ) {}

  async execute(query: GetRankedFeedQuery) {
    try {
      const { tenantId, userId, page, limit, category, city, feedType } = query;
      const skip = (page - 1) * limit;

      // Get user context (following, past categories)
      const [follows, recentEngagements] = await Promise.all([
        this.mktPrisma.client.mktFollow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
          take: 200,
        }),
        this.mktPrisma.client.mktAnalyticsEvent.findMany({
          where: { userId, eventType: 'CLICK', tenantId },
          select: { entityId: true },
          orderBy: { timestamp: 'desc' },
          take: 50,
        }),
      ]);

      const followingIds = follows.map((f: { followingId: string }) => f.followingId);

      // Build post query
      const postWhere: Record<string, any> = {
        tenantId,
        status: 'ACTIVE',
        isDeleted: false,
      };

      if (feedType === 'following') {
        postWhere.authorId = { in: followingIds };
      }
      if (feedType === 'trending') {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        postWhere.createdAt = { gte: since };
      }

      const [posts, listings] = await Promise.all([
        this.mktPrisma.client.mktPost.findMany({
          where: postWhere,
          orderBy: { createdAt: 'desc' },
          take: limit * 3,
          skip,
        }),
        feedType !== 'following'
          ? this.mktPrisma.client.mktListing.findMany({
              where: {
                tenantId,
                status: 'ACTIVE',
                isDeleted: false,
                ...(category ? { categoryId: category } : {}),
              },
              orderBy: { createdAt: 'desc' },
              take: limit,
              skip,
            })
          : Promise.resolve([]),
      ]);

      const userCtx: UserContext = {
        userId,
        city,
        followingIds,
        interactedCategoryIds: [],
      };

      const rankableItems: RankableItem[] = [
        ...posts.map((p: any) => ({
          id: p.id,
          type: 'POST' as const,
          createdAt: p.createdAt,
          viewCount: p.viewCount,
          likeCount: p.likeCount,
          commentCount: p.commentCount,
          shareCount: p.shareCount,
          authorId: p.authorId,
          isFeatured: false,
          hasActiveOffer: !!p.linkedOfferId,
          postType: p.postType,
        })),
        ...listings.map((l: any) => ({
          id: l.id,
          type: 'LISTING' as const,
          createdAt: l.createdAt,
          viewCount: l.viewCount,
          categoryId: l.categoryId ?? undefined,
          authorId: l.authorId,
          isFeatured: l.isFeatured,
          hasActiveOffer: false,
        })),
      ];

      const ranked = this.ranker.rank(rankableItems, userCtx);
      const paginated = ranked.slice(0, limit);

      // Enrich items with full data
      const postIds = paginated.filter(i => i.type === 'POST').map(i => i.id);
      const listingIds = paginated.filter(i => i.type === 'LISTING').map(i => i.id);

      const [fullPosts, fullListings] = await Promise.all([
        postIds.length > 0
          ? this.mktPrisma.client.mktPost.findMany({ where: { id: { in: postIds } } })
          : Promise.resolve([]),
        listingIds.length > 0
          ? this.mktPrisma.client.mktListing.findMany({ where: { id: { in: listingIds } } })
          : Promise.resolve([]),
      ]);

      const postMap = new Map((fullPosts as any[]).map((p: Record<string, unknown>) => [p.id, p]));
      const listingMap = new Map((fullListings as any[]).map((l: Record<string, unknown>) => [l.id, l]));

      const feedItems = paginated.map(item => {
        if (item.type === 'POST') {
          return { type: 'POST', data: postMap.get(item.id) };
        }
        return { type: 'LISTING', data: listingMap.get(item.id) };
      });

      // suppress unused variable warning
      void recentEngagements;

      return {
        items: feedItems,
        page,
        limit,
        hasMore: ranked.length > limit,
      };
    } catch (error) {
      this.logger.error(`GetRankedFeedHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
