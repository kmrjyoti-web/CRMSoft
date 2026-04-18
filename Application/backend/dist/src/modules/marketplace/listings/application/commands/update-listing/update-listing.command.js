"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateListingCommand = void 0;
class UpdateListingCommand {
    constructor(id, tenantId, updatedById, title, description, shortDescription, categoryId, subcategoryId, mediaUrls, basePrice, mrp, minOrderQty, maxOrderQty, hsnCode, gstRate, stockAvailable, visibility, visibilityConfig, publishAt, expiresAt, attributes, keywords, shippingConfig, requirementConfig) {
        this.id = id;
        this.tenantId = tenantId;
        this.updatedById = updatedById;
        this.title = title;
        this.description = description;
        this.shortDescription = shortDescription;
        this.categoryId = categoryId;
        this.subcategoryId = subcategoryId;
        this.mediaUrls = mediaUrls;
        this.basePrice = basePrice;
        this.mrp = mrp;
        this.minOrderQty = minOrderQty;
        this.maxOrderQty = maxOrderQty;
        this.hsnCode = hsnCode;
        this.gstRate = gstRate;
        this.stockAvailable = stockAvailable;
        this.visibility = visibility;
        this.visibilityConfig = visibilityConfig;
        this.publishAt = publishAt;
        this.expiresAt = expiresAt;
        this.attributes = attributes;
        this.keywords = keywords;
        this.shippingConfig = shippingConfig;
        this.requirementConfig = requirementConfig;
    }
}
exports.UpdateListingCommand = UpdateListingCommand;
//# sourceMappingURL=update-listing.command.js.map