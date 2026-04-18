"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateInvoiceCommand = void 0;
class GenerateInvoiceCommand {
    constructor(tenantId, subscriptionId, periodStart, periodEnd, amount, tax) {
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.amount = amount;
        this.tax = tax;
    }
}
exports.GenerateInvoiceCommand = GenerateInvoiceCommand;
//# sourceMappingURL=generate-invoice.command.js.map