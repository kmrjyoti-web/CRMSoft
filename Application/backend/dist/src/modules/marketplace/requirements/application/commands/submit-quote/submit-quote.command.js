"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitQuoteCommand = void 0;
class SubmitQuoteCommand {
    constructor(requirementId, sellerId, tenantId, pricePerUnit, quantity, deliveryDays, creditDays, notes, certifications) {
        this.requirementId = requirementId;
        this.sellerId = sellerId;
        this.tenantId = tenantId;
        this.pricePerUnit = pricePerUnit;
        this.quantity = quantity;
        this.deliveryDays = deliveryDays;
        this.creditDays = creditDays;
        this.notes = notes;
        this.certifications = certifications;
    }
}
exports.SubmitQuoteCommand = SubmitQuoteCommand;
//# sourceMappingURL=submit-quote.command.js.map