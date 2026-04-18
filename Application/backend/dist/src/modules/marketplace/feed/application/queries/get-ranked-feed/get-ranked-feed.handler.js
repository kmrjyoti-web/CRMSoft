"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GetRankedFeedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRankedFeedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_ranked_feed_query_1 = require("./get-ranked-feed.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
const feed_ranker_service_1 = require("../../services/feed-ranker.service");
let GetRankedFeedHandler = GetRankedFeedHandler_1 = class GetRankedFeedHandler {
    constructor(mktPrisma, ranker) {
        this.mktPrisma = mktPrisma;
        this.ranker = ranker;
        this.logger = new common_1.Logger(GetRankedFeedHandler_1.name);
    }
    async execute(query) {
        try {
            const { tenantId, userId, page, limit, category, city, feedType } = query;
            const skip = (page - 1) * limit;
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
            const followingIds = follows.map((f) => f.followingId);
            const postWhere = {
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
            const userCtx = {
                userId,
                city,
                followingIds,
                interactedCategoryIds: [],
            };
            const rankableItems = [
                ...posts.map((p) => ({
                    id: p.id,
                    type: 'POST',
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
                ...listings.map((l) => ({
                    id: l.id,
                    type: 'LISTING',
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
            const postMap = new Map(fullPosts.map((p) => [p.id, p]));
            const listingMap = new Map(fullListings.map((l) => [l.id, l]));
            const feedItems = paginated.map(item => {
                if (item.type === 'POST') {
                    return { type: 'POST', data: postMap.get(item.id) };
                }
                return { type: 'LISTING', data: listingMap.get(item.id) };
            });
            void recentEngagements;
            return {
                items: feedItems,
                page,
                limit,
                hasMore: ranked.length > limit,
            };
        }
        catch (error) {
            this.logger.error(`GetRankedFeedHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetRankedFeedHandler = GetRankedFeedHandler;
exports.GetRankedFeedHandler = GetRankedFeedHandler = GetRankedFeedHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_ranked_feed_query_1.GetRankedFeedQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService,
        feed_ranker_service_1.FeedRankerService])
], GetRankedFeedHandler);
//# sourceMappingURL=get-ranked-feed.handler.js.map