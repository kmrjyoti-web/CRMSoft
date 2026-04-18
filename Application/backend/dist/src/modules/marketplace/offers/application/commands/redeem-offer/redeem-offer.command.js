"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedeemOfferCommand = void 0;
class RedeemOfferCommand {
    constructor(offerId, tenantId, userId, orderId, orderValue, quantity, productId, categoryId, city, state, pincode, deviceType, grade, groupId, isVerified) {
        this.offerId = offerId;
        this.tenantId = tenantId;
        this.userId = userId;
        this.orderId = orderId;
        this.orderValue = orderValue;
        this.quantity = quantity;
        this.productId = productId;
        this.categoryId = categoryId;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.deviceType = deviceType;
        this.grade = grade;
        this.groupId = groupId;
        this.isVerified = isVerified;
    }
}
exports.RedeemOfferCommand = RedeemOfferCommand;
//# sourceMappingURL=redeem-offer.command.js.map