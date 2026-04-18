"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordPaymentCommand = void 0;
class RecordPaymentCommand {
    constructor(tenantId, invoiceId, gatewayPaymentId, amount) {
        this.tenantId = tenantId;
        this.invoiceId = invoiceId;
        this.gatewayPaymentId = gatewayPaymentId;
        this.amount = amount;
    }
}
exports.RecordPaymentCommand = RecordPaymentCommand;
//# sourceMappingURL=record-payment.command.js.map