"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOfferCommand = void 0;
class CreateOfferCommand {
    constructor(tenantId, authorId, createdById, title, offerType, discountType, discountValue, description, mediaUrls, linkedListingIds, linkedCategoryIds, primaryListingId, conditions, maxRedemptions, autoCloseOnLimit, resetTime, publishAt, expiresAt) {
        this.tenantId = tenantId;
        this.authorId = authorId;
        this.createdById = createdById;
        this.title = title;
        this.offerType = offerType;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.description = description;
        this.mediaUrls = mediaUrls;
        this.linkedListingIds = linkedListingIds;
        this.linkedCategoryIds = linkedCategoryIds;
        this.primaryListingId = primaryListingId;
        this.conditions = conditions;
        this.maxRedemptions = maxRedemptions;
        this.autoCloseOnLimit = autoCloseOnLimit;
        this.resetTime = resetTime;
        this.publishAt = publishAt;
        this.expiresAt = expiresAt;
    }
}
exports.CreateOfferCommand = CreateOfferCommand;
//# sourceMappingURL=create-offer.command.js.map