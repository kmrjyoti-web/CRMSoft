"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRankedFeedQuery = void 0;
class GetRankedFeedQuery {
    constructor(tenantId, userId, page = 1, limit = 20, category, city, feedType = 'main') {
        this.tenantId = tenantId;
        this.userId = userId;
        this.page = page;
        this.limit = limit;
        this.category = category;
        this.city = city;
        this.feedType = feedType;
    }
}
exports.GetRankedFeedQuery = GetRankedFeedQuery;
//# sourceMappingURL=get-ranked-feed.query.js.map