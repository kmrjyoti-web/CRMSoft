"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRequirementCommand = void 0;
class PostRequirementCommand {
    constructor(tenantId, authorId, title, description, categoryId, quantity, targetPrice, currency, deadline, mediaUrls, attributes, keywords) {
        this.tenantId = tenantId;
        this.authorId = authorId;
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.quantity = quantity;
        this.targetPrice = targetPrice;
        this.currency = currency;
        this.deadline = deadline;
        this.mediaUrls = mediaUrls;
        this.attributes = attributes;
        this.keywords = keywords;
    }
}
exports.PostRequirementCommand = PostRequirementCommand;
//# sourceMappingURL=post-requirement.command.js.map