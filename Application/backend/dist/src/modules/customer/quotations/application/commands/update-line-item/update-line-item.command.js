"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLineItemCommand = void 0;
class UpdateLineItemCommand {
    constructor(quotationId, itemId, userId, userName, productName, description, quantity, unit, unitPrice, discountType, discountValue, gstRate, cessRate, isOptional, notes) {
        this.quotationId = quotationId;
        this.itemId = itemId;
        this.userId = userId;
        this.userName = userName;
        this.productName = productName;
        this.description = description;
        this.quantity = quantity;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.gstRate = gstRate;
        this.cessRate = cessRate;
        this.isOptional = isOptional;
        this.notes = notes;
    }
}
exports.UpdateLineItemCommand = UpdateLineItemCommand;
//# sourceMappingURL=update-line-item.command.js.map