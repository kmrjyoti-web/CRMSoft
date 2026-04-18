"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLineItemCommand = void 0;
class AddLineItemCommand {
    constructor(quotationId, userId, userName, productId, productName, description, quantity, unit, unitPrice, mrp, discountType, discountValue, gstRate, cessRate, isOptional, notes) {
        this.quotationId = quotationId;
        this.userId = userId;
        this.userName = userName;
        this.productId = productId;
        this.productName = productName;
        this.description = description;
        this.quantity = quantity;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.mrp = mrp;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.gstRate = gstRate;
        this.cessRate = cessRate;
        this.isOptional = isOptional;
        this.notes = notes;
    }
}
exports.AddLineItemCommand = AddLineItemCommand;
//# sourceMappingURL=add-line-item.command.js.map