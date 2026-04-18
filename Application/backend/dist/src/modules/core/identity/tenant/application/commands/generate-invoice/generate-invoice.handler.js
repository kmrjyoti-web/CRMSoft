"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GenerateInvoiceHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateInvoiceHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const generate_invoice_command_1 = require("./generate-invoice.command");
const invoice_generator_service_1 = require("../../../services/invoice-generator.service");
let GenerateInvoiceHandler = GenerateInvoiceHandler_1 = class GenerateInvoiceHandler {
    constructor(invoiceGenerator) {
        this.invoiceGenerator = invoiceGenerator;
        this.logger = new common_1.Logger(GenerateInvoiceHandler_1.name);
    }
    async execute(command) {
        try {
            const invoice = await this.invoiceGenerator.generate({
                tenantId: command.tenantId,
                subscriptionId: command.subscriptionId,
                periodStart: command.periodStart,
                periodEnd: command.periodEnd,
                amount: command.amount,
                tax: command.tax,
            });
            this.logger.log(`Invoice generated: ${invoice.invoiceNumber} for tenant ${command.tenantId}`);
            return invoice;
        }
        catch (error) {
            this.logger.error(`GenerateInvoiceHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GenerateInvoiceHandler = GenerateInvoiceHandler;
exports.GenerateInvoiceHandler = GenerateInvoiceHandler = GenerateInvoiceHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(generate_invoice_command_1.GenerateInvoiceCommand),
    __metadata("design:paramtypes", [invoice_generator_service_1.InvoiceGeneratorService])
], GenerateInvoiceHandler);
//# sourceMappingURL=generate-invoice.handler.js.map