"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingEntity = void 0;
class ListingEntity {
    constructor(props) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.authorId = props.authorId;
        this.listingType = props.listingType;
        this.title = props.title;
        this.description = props.description;
        this.shortDescription = props.shortDescription;
        this.categoryId = props.categoryId;
        this.subcategoryId = props.subcategoryId;
        this.mediaUrls = props.mediaUrls || [];
        this.currency = props.currency || 'INR';
        this.basePrice = props.basePrice || 0;
        this.mrp = props.mrp;
        this.minOrderQty = props.minOrderQty || 1;
        this.maxOrderQty = props.maxOrderQty;
        this.hsnCode = props.hsnCode;
        this.gstRate = props.gstRate;
        this.trackInventory = props.trackInventory !== false;
        this.stockAvailable = props.stockAvailable || 0;
        this.visibility = props.visibility || 'PUBLIC';
        this.visibilityConfig = props.visibilityConfig;
        this.status = props.status || 'DRAFT';
        this.publishAt = props.publishAt;
        this.expiresAt = props.expiresAt;
        this.attributes = props.attributes || {};
        this.keywords = props.keywords || [];
        this.shippingConfig = props.shippingConfig;
        this.requirementConfig = props.requirementConfig;
        this.viewCount = 0;
        this.enquiryCount = 0;
        this.orderCount = 0;
        this.reviewCount = 0;
        this.isFeatured = false;
        this.isActive = true;
        this.isDeleted = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.createdById = props.createdById;
    }
    static create(props) {
        return new ListingEntity(props);
    }
    publish() {
        if (this.status !== 'DRAFT' && this.status !== 'SCHEDULED') {
            throw new Error(`Cannot publish listing in status: ${this.status}`);
        }
        this.status = 'ACTIVE';
        this.publishedAt = new Date();
    }
    pause() {
        if (this.status !== 'ACTIVE') {
            throw new Error('Can only pause active listings');
        }
        this.status = 'PAUSED';
    }
    archive() {
        this.status = 'ARCHIVED';
        this.isActive = false;
    }
    canBePublished() {
        return this.status === 'DRAFT' || this.status === 'SCHEDULED';
    }
    isExpired() {
        if (!this.expiresAt)
            return false;
        return new Date() > this.expiresAt;
    }
    toPlainObject() {
        return { ...this };
    }
}
exports.ListingEntity = ListingEntity;
//# sourceMappingURL=listing.entity.js.map