"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEffectivePriceQuery = void 0;
class GetEffectivePriceQuery {
    constructor(productId, contactId, organizationId, quantity = 1, isInterState = false) {
        this.productId = productId;
        this.contactId = contactId;
        this.organizationId = organizationId;
        this.quantity = quantity;
        this.isInterState = isInterState;
    }
}
exports.GetEffectivePriceQuery = GetEffectivePriceQuery;
//# sourceMappingURL=get-effective-price.query.js.map