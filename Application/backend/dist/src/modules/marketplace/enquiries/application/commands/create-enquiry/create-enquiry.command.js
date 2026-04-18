"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEnquiryCommand = void 0;
class CreateEnquiryCommand {
    constructor(tenantId, listingId, enquirerId, message, quantity, expectedPrice, deliveryPincode) {
        this.tenantId = tenantId;
        this.listingId = listingId;
        this.enquirerId = enquirerId;
        this.message = message;
        this.quantity = quantity;
        this.expectedPrice = expectedPrice;
        this.deliveryPincode = deliveryPincode;
    }
}
exports.CreateEnquiryCommand = CreateEnquiryCommand;
//# sourceMappingURL=create-enquiry.command.js.map