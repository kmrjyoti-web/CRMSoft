"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFeedQuery = void 0;
class GetFeedQuery {
    constructor(tenantId, userId, page = 1, limit = 20, postType, authorId) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.page = page;
        this.limit = limit;
        this.postType = postType;
        this.authorId = authorId;
    }
}
exports.GetFeedQuery = GetFeedQuery;
//# sourceMappingURL=get-feed.query.js.map