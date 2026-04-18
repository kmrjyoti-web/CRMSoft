"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogNegotiationCommand = void 0;
class LogNegotiationCommand {
    constructor(quotationId, userId, userName, negotiationType, customerRequirement, customerBudget, customerPriceExpected, ourPrice, proposedDiscount, counterOfferAmount, itemsAdded, itemsRemoved, itemsModified, termsChanged, note, outcome, contactPersonId, contactPersonName) {
        this.quotationId = quotationId;
        this.userId = userId;
        this.userName = userName;
        this.negotiationType = negotiationType;
        this.customerRequirement = customerRequirement;
        this.customerBudget = customerBudget;
        this.customerPriceExpected = customerPriceExpected;
        this.ourPrice = ourPrice;
        this.proposedDiscount = proposedDiscount;
        this.counterOfferAmount = counterOfferAmount;
        this.itemsAdded = itemsAdded;
        this.itemsRemoved = itemsRemoved;
        this.itemsModified = itemsModified;
        this.termsChanged = termsChanged;
        this.note = note;
        this.outcome = outcome;
        this.contactPersonId = contactPersonId;
        this.contactPersonName = contactPersonName;
    }
}
exports.LogNegotiationCommand = LogNegotiationCommand;
//# sourceMappingURL=log-negotiation.command.js.map