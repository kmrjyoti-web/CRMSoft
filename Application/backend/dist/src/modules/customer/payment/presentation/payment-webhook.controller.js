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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("../services/payment.service");
const razorpay_gateway_service_1 = require("../services/razorpay-gateway.service");
const stripe_gateway_service_1 = require("../services/stripe-gateway.service");
const payment_gateway_factory_service_1 = require("../services/payment-gateway-factory.service");
const error_utils_1 = require("../../../../common/utils/error.utils");
let PaymentWebhookController = PaymentWebhookController_1 = class PaymentWebhookController {
    constructor(paymentService, razorpay, stripe, gatewayFactory) {
        this.paymentService = paymentService;
        this.razorpay = razorpay;
        this.stripe = stripe;
        this.gatewayFactory = gatewayFactory;
        this.logger = new common_1.Logger(PaymentWebhookController_1.name);
    }
    async razorpayWebhook(tenantId, body, signature) {
        this.logger.log(`Razorpay webhook received for tenant ${tenantId}: ${body.event}`);
        try {
            const creds = await this.gatewayFactory.getCredentials(tenantId, 'RAZORPAY');
            if (creds.webhookSecret && signature) {
                const rawBody = JSON.stringify(body);
                const valid = this.razorpay.verifyWebhookSignature(creds.webhookSecret, rawBody, signature);
                if (!valid) {
                    this.logger.warn('Razorpay webhook signature invalid');
                    return { status: 'invalid_signature' };
                }
            }
            await this.paymentService.handleWebhook(tenantId, 'RAZORPAY', body.event, body.payload);
            return { status: 'ok' };
        }
        catch (err) {
            this.logger.error(`Razorpay webhook error: ${(0, error_utils_1.getErrorMessage)(err)}`);
            return { status: 'error', message: (0, error_utils_1.getErrorMessage)(err) };
        }
    }
    async stripeWebhook(tenantId, body, signature) {
        this.logger.log(`Stripe webhook received for tenant ${tenantId}: ${body.type}`);
        try {
            const creds = await this.gatewayFactory.getCredentials(tenantId, 'STRIPE');
            if (creds.webhookSecret && signature) {
                const rawBody = JSON.stringify(body);
                const valid = this.stripe.verifyWebhookSignature(creds.webhookSecret, rawBody, signature);
                if (!valid) {
                    this.logger.warn('Stripe webhook signature invalid');
                    return { status: 'invalid_signature' };
                }
            }
            await this.paymentService.handleWebhook(tenantId, 'STRIPE', body.type, body);
            return { status: 'ok' };
        }
        catch (err) {
            this.logger.error(`Stripe webhook error: ${(0, error_utils_1.getErrorMessage)(err)}`);
            return { status: 'error', message: (0, error_utils_1.getErrorMessage)(err) };
        }
    }
};
exports.PaymentWebhookController = PaymentWebhookController;
__decorate([
    (0, common_1.Post)('razorpay/:tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-razorpay-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], PaymentWebhookController.prototype, "razorpayWebhook", null);
__decorate([
    (0, common_1.Post)('stripe/:tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], PaymentWebhookController.prototype, "stripeWebhook", null);
exports.PaymentWebhookController = PaymentWebhookController = PaymentWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Payment Webhooks'),
    (0, common_1.Controller)('webhooks/payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        razorpay_gateway_service_1.RazorpayGatewayService,
        stripe_gateway_service_1.StripeGatewayService,
        payment_gateway_factory_service_1.PaymentGatewayFactoryService])
], PaymentWebhookController);
//# sourceMappingURL=payment-webhook.controller.js.map