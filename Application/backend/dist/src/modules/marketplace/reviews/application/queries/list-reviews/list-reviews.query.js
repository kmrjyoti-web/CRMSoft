"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListReviewsQuery = void 0;
class ListReviewsQuery {
    constructor(tenantId, listingId, reviewerId, status, page = 1, limit = 20) {
        this.tenantId = tenantId;
        this.listingId = listingId;
        this.reviewerId = reviewerId;
        this.status = status;
        this.page = page;
        this.limit = limit;
    }
}
exports.ListReviewsQuery = ListReviewsQuery;
//# sourceMappingURL=list-reviews.query.js.map