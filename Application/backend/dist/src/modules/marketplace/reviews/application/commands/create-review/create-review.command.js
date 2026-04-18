"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewCommand = void 0;
class CreateReviewCommand {
    constructor(tenantId, listingId, reviewerId, rating, title, body, mediaUrls, orderId) {
        this.tenantId = tenantId;
        this.listingId = listingId;
        this.reviewerId = reviewerId;
        this.rating = rating;
        this.title = title;
        this.body = body;
        this.mediaUrls = mediaUrls;
        this.orderId = orderId;
    }
}
exports.CreateReviewCommand = CreateReviewCommand;
//# sourceMappingURL=create-review.command.js.map