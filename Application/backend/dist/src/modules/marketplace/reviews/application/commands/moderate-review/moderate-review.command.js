"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerateReviewCommand = void 0;
class ModerateReviewCommand {
    constructor(reviewId, tenantId, moderatorId, action, note) {
        this.reviewId = reviewId;
        this.tenantId = tenantId;
        this.moderatorId = moderatorId;
        this.action = action;
        this.note = note;
    }
}
exports.ModerateReviewCommand = ModerateReviewCommand;
//# sourceMappingURL=moderate-review.command.js.map