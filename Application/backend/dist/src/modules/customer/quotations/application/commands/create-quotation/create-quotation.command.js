"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuotationCommand = void 0;
class CreateQuotationCommand {
    constructor(userId, userName, tenantId, leadId, contactPersonId, organizationId, title, summary, coverNote, priceType, minAmount, maxAmount, plusMinusPercent, validFrom, validUntil, paymentTerms, deliveryTerms, warrantyTerms, termsConditions, discountType, discountValue, items, tags, internalNotes) {
        this.userId = userId;
        this.userName = userName;
        this.tenantId = tenantId;
        this.leadId = leadId;
        this.contactPersonId = contactPersonId;
        this.organizationId = organizationId;
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
        this.items = items;
        this.tags = tags;
        this.internalNotes = internalNotes;
    }
}
exports.CreateQuotationCommand = CreateQuotationCommand;
//# sourceMappingURL=create-quotation.command.js.map