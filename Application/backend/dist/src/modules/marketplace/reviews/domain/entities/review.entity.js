"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewEntity = void 0;
class ReviewEntity {
    constructor(props) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.listingId = props.listingId;
        this.reviewerId = props.reviewerId;
        this.rating = props.rating;
        this.title = props.title;
        this.body = props.body;
        this.mediaUrls = props.mediaUrls || [];
        this.isVerifiedPurchase = props.isVerifiedPurchase || false;
        this.orderId = props.orderId;
        this.status = props.status ?? (props.isVerifiedPurchase ? 'APPROVED' : 'PENDING');
        this.helpfulCount = 0;
        this.reportCount = 0;
        this.isDeleted = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    static create(props) {
        if (props.rating < 1 || props.rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        return new ReviewEntity(props);
    }
    approve(moderatorId, note) {
        this.status = 'APPROVED';
        this.moderatorId = moderatorId;
        this.moderationNote = note;
    }
    reject(moderatorId, note) {
        this.status = 'REJECTED';
        this.moderatorId = moderatorId;
        this.moderationNote = note;
    }
    flag(moderatorId, note) {
        this.status = 'FLAGGED';
        this.moderatorId = moderatorId;
        this.moderationNote = note;
    }
    isApproved() {
        return this.status === 'APPROVED';
    }
}
exports.ReviewEntity = ReviewEntity;
//# sourceMappingURL=review.entity.js.map