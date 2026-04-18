"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuotationCommand = void 0;
class UpdateQuotationCommand {
    constructor(id, userId, userName, title, summary, coverNote, priceType, minAmount, maxAmount, plusMinusPercent, validFrom, validUntil, paymentTerms, deliveryTerms, warrantyTerms, termsConditions, discountType, discountValue, tags, internalNotes) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.title = title;
        this.summary = summary;
        this.coverNote = coverNote;
        this.priceType = priceType;
        this.minAmount = minAmount;
        this.maxAmount = maxAmount;
        this.plusMinusPercent = plusMinusPercent;
        this.validFrom = validFrom;
        this.validUntil = validUntil;
        this.paymentTerms = paymentTerms;
        this.deliveryTerms = deliveryTerms;
        this.warrantyTerms = warrantyTerms;
        this.termsConditions = termsConditions;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.tags = tags;
        this.internalNotes = internalNotes;
    }
}
exports.UpdateQuotationCommand = UpdateQuotationCommand;
//# sourceMappingURL=update-quotation.command.js.map