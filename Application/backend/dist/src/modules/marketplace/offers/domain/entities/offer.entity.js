"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferEntity = void 0;
const offer_conditions_vo_1 = require("../value-objects/offer-conditions.vo");
class OfferEntity {
    constructor(props) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.authorId = props.authorId;
        this.title = props.title;
        this.description = props.description;
        this.mediaUrls = props.mediaUrls || [];
        this.offerType = props.offerType;
        this.discountType = props.discountType;
        this.discountValue = props.discountValue;
        this.linkedListingIds = props.linkedListingIds || [];
        this.linkedCategoryIds = props.linkedCategoryIds || [];
        this.primaryListingId = props.primaryListingId;
        this.conditions = offer_conditions_vo_1.OfferConditionsVO.fromJson(props.conditions || {});
        this.maxRedemptions = props.maxRedemptions;
        this.currentRedemptions = props.currentRedemptions || 0;
        this.autoCloseOnLimit = props.autoCloseOnLimit !== false;
        this.resetTime = props.resetTime;
        this.lastResetAt = props.lastResetAt;
        this.status = props.status || 'DRAFT';
        this.publishAt = props.publishAt;
        this.expiresAt = props.expiresAt;
        this.publishedAt = props.publishedAt;
        this.closedAt = props.closedAt;
        this.closedReason = props.closedReason;
        this.createdById = props.createdById;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    static create(props) {
        return new OfferEntity(props);
    }
    static fromPrisma(raw) {
        return new OfferEntity({
            ...raw,
            conditions: raw.conditions,
        });
    }
    isActiveNow() {
        if (this.status !== 'ACTIVE')
            return false;
        const now = new Date();
        if (this.expiresAt && now > this.expiresAt)
            return false;
        if (this.offerType === 'DAILY_RECURRING') {
            return this.conditions.isWithinTimeWindow();
        }
        if (this.offerType === 'WEEKLY_RECURRING') {
            return this.conditions.isWithinTimeWindow();
        }
        if (this.offerType === 'FIRST_N_ORDERS') {
            if (this.maxRedemptions !== undefined && this.currentRedemptions >= this.maxRedemptions) {
                return false;
            }
        }
        return true;
    }
    isEligible(params) {
        if (!this.isActiveNow()) {
            return { eligible: false, reason: 'Offer is not currently active' };
        }
        if (!this.conditions.isGeoAllowed({ city: params.city, state: params.state, pincode: params.pincode })) {
            return { eligible: false, reason: 'Offer not available in your location' };
        }
        if (!this.conditions.isCustomerGroupAllowed({
            grade: params.grade,
            groupId: params.groupId,
            isVerified: params.isVerified,
        })) {
            return { eligible: false, reason: 'You are not eligible for this offer based on your customer group' };
        }
        if (!this.conditions.isOrderEligible({
            orderValue: params.orderValue,
            quantity: params.quantity,
            productId: params.productId,
            categoryId: params.categoryId,
        })) {
            return { eligible: false, reason: 'Order does not meet the minimum requirements for this offer' };
        }
        const maxPerUser = this.conditions.maxPerUser;
        if (maxPerUser !== undefined && params.userRedemptionCount !== undefined) {
            if (params.userRedemptionCount >= maxPerUser) {
                return { eligible: false, reason: `You have reached the maximum redemptions (${maxPerUser}) for this offer` };
            }
        }
        if (this.maxRedemptions !== undefined && this.currentRedemptions >= this.maxRedemptions) {
            return { eligible: false, reason: 'Offer redemption limit has been reached' };
        }
        return { eligible: true };
    }
    redeem(userId, orderInfo) {
        if (this.maxRedemptions !== undefined && this.currentRedemptions >= this.maxRedemptions) {
            throw new Error('Offer redemption limit has been reached');
        }
        if (!this.isActiveNow()) {
            throw new Error('Offer is not currently active');
        }
        this.currentRedemptions += 1;
        if (this.autoCloseOnLimit && this.maxRedemptions !== undefined && this.currentRedemptions >= this.maxRedemptions) {
            this.close('Redemption limit reached');
        }
    }
    resetCounter() {
        if (this.offerType !== 'DAILY_RECURRING' && this.offerType !== 'WEEKLY_RECURRING') {
            throw new Error(`Cannot reset counter for offer type: ${this.offerType}`);
        }
        this.currentRedemptions = 0;
        this.lastResetAt = new Date();
    }
    close(reason) {
        this.status = 'CLOSED';
        this.closedAt = new Date();
        this.closedReason = reason;
    }
    activate() {
        if (this.status !== 'DRAFT' && this.status !== 'SCHEDULED' && this.status !== 'PAUSED') {
            throw new Error(`Cannot activate offer in status: ${this.status}`);
        }
        this.status = 'ACTIVE';
        if (!this.publishedAt)
            this.publishedAt = new Date();
    }
    calculateDiscount(orderValue, quantity) {
        switch (this.discountType) {
            case 'PERCENTAGE':
                return Math.round((orderValue * this.discountValue) / 100);
            case 'FLAT_AMOUNT':
                return Math.min(this.discountValue, orderValue);
            case 'FREE_SHIPPING':
                return this.discountValue;
            case 'BUNDLE_PRICE':
                return Math.max(0, orderValue - this.discountValue);
            default:
                return 0;
        }
    }
}
exports.OfferEntity = OfferEntity;
//# sourceMappingURL=offer.entity.js.map