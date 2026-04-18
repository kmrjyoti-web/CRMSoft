"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedRankerService = void 0;
const common_1 = require("@nestjs/common");
let FeedRankerService = class FeedRankerService {
    score(item, userCtx) {
        return (this.recencyScore(item.createdAt) +
            this.engagementScore(item) +
            this.relevanceScore(item, userCtx) +
            this.boostScore(item));
    }
    rank(items, userCtx) {
        return items
            .map(item => ({ item, score: this.score(item, userCtx) }))
            .sort((a, b) => b.score - a.score)
            .map(({ item }) => item);
    }
    recencyScore(createdAt) {
        const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (ageHours < 1)
            return 1.0;
        if (ageHours < 6)
            return 0.8;
        if (ageHours < 24)
            return 0.5;
        if (ageHours < 168)
            return 0.2;
        return 0.05;
    }
    engagementScore(item) {
        if (!item.viewCount || item.viewCount === 0)
            return 0;
        const engagement = (item.likeCount ?? 0) +
            (item.commentCount ?? 0) * 2 +
            (item.shareCount ?? 0) * 3;
        return Math.min(engagement / item.viewCount, 1.0);
    }
    relevanceScore(item, ctx) {
        let score = 0;
        if (item.categoryId && ctx.interactedCategoryIds.includes(item.categoryId)) {
            score += 0.3;
        }
        if (item.city && ctx.city && item.city === ctx.city)
            score += 0.2;
        if (item.state && ctx.state && item.state === ctx.state)
            score += 0.1;
        if (item.authorId && ctx.followingIds.includes(item.authorId))
            score += 0.3;
        return score;
    }
    boostScore(item) {
        let score = 0;
        if (item.isFeatured)
            score += 0.5;
        if (item.hasActiveOffer)
            score += 0.3;
        if (item.postType === 'PRODUCT_LAUNCH')
            score += 0.2;
        return score;
    }
};
exports.FeedRankerService = FeedRankerService;
exports.FeedRankerService = FeedRankerService = __decorate([
    (0, common_1.Injectable)()
], FeedRankerService);
//# sourceMappingURL=feed-ranker.service.js.map