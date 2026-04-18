"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateListingCommand = void 0;
class CreateListingCommand {
    constructor(tenantId, authorId, listingType, title, createdById, description, shortDescription, categoryId, subcategoryId, mediaUrls, currency, basePrice, mrp, minOrderQty, maxOrderQty, hsnCode, gstRate, trackInventory, stockAvailable, visibility, visibilityConfig, publishAt, expiresAt, attributes, keywords, shippingConfig, requirementConfig, priceTiers) {
        this.tenantId = tenantId;
        this.authorId = authorId;
        this.listingType = listingType;
        this.title = title;
        this.createdById = createdById;
        this.description = description;
        this.shortDescription = shortDescription;
        this.categoryId = categoryId;
        this.subcategoryId = subcategoryId;
        this.mediaUrls = mediaUrls;
        this.currency = currency;
        this.basePrice = basePrice;
        this.mrp = mrp;
        this.minOrderQty = minOrderQty;
        this.maxOrderQty = maxOrderQty;
        this.hsnCode = hsnCode;
        this.gstRate = gstRate;
        this.trackInventory = trackInventory;
        this.stockAvailable = stockAvailable;
        this.visibility = visibility;
        this.visibilityConfig = visibilityConfig;
        this.publishAt = publishAt;
        this.expiresAt = expiresAt;
        this.attributes = attributes;
        this.keywords = keywords;
        this.shippingConfig = shippingConfig;
        this.requirementConfig = requirementConfig;
        this.priceTiers = priceTiers;
    }
}
exports.CreateListingCommand = CreateListingCommand;
//# sourceMappingURL=create-listing.command.js.map