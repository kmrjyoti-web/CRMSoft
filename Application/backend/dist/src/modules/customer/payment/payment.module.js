"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../core/prisma/prisma.module");
const settings_module_1 = require("../../core/identity/settings/settings.module");
const gst_calculator_service_1 = require("./services/gst-calculator.service");
const amount_in_words_service_1 = require("./services/amount-in-words.service");
const invoice_service_1 = require("./services/invoice.service");
const proforma_invoice_service_1 = require("./services/proforma-invoice.service");
const razorpay_gateway_service_1 = require("./services/razorpay-gateway.service");
const stripe_gateway_service_1 = require("./services/stripe-gateway.service");
const payment_gateway_factory_service_1 = require("./services/payment-gateway-factory.service");
const payment_service_1 = require("./services/payment.service");
const receipt_service_1 = require("./services/receipt.service");
const refund_service_1 = require("./services/refund.service");
const credit_note_service_1 = require("./services/credit-note.service");
const payment_reminder_service_1 = require("./services/payment-reminder.service");
const payment_analytics_service_1 = require("./services/payment-analytics.service");
const payment_seeder_service_1 = require("./services/payment-seeder.service");
const invoice_controller_1 = require("./presentation/invoice.controller");
const proforma_invoice_controller_1 = require("./presentation/proforma-invoice.controller");
const payment_controller_1 = require("./presentation/payment.controller");
const receipt_controller_1 = require("./presentation/receipt.controller");
const refund_controller_1 = require("./presentation/refund.controller");
const credit_note_controller_1 = require("./presentation/credit-note.controller");
const payment_webhook_controller_1 = require("./presentation/payment-webhook.controller");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, settings_module_1.SettingsModule],
        providers: [
            gst_calculator_service_1.GstCalculatorService,
            amount_in_words_service_1.AmountInWordsService,
            invoice_service_1.InvoiceService,
            proforma_invoice_service_1.ProformaInvoiceService,
            razorpay_gateway_service_1.RazorpayGatewayService,
            stripe_gateway_service_1.StripeGatewayService,
            payment_gateway_factory_service_1.PaymentGatewayFactoryService,
            payment_service_1.PaymentService,
            receipt_service_1.ReceiptService,
            refund_service_1.RefundService,
            credit_note_service_1.CreditNoteService,
            payment_reminder_service_1.PaymentReminderService,
            payment_analytics_service_1.PaymentAnalyticsService,
            payment_seeder_service_1.PaymentSeederService,
        ],
        controllers: [
            invoice_controller_1.InvoiceController,
            proforma_invoice_controller_1.ProformaInvoiceController,
            payment_controller_1.PaymentController,
            receipt_controller_1.ReceiptController,
            refund_controller_1.RefundController,
            credit_note_controller_1.CreditNoteController,
            payment_webhook_controller_1.PaymentWebhookController,
        ],
        exports: [
            invoice_service_1.InvoiceService,
            proforma_invoice_service_1.ProformaInvoiceService,
            payment_service_1.PaymentService,
            gst_calculator_service_1.GstCalculatorService,
            amount_in_words_service_1.AmountInWordsService,
            payment_reminder_service_1.PaymentReminderService,
            payment_seeder_service_1.PaymentSeederService,
            receipt_service_1.ReceiptService,
            refund_service_1.RefundService,
            credit_note_service_1.CreditNoteService,
        ],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map