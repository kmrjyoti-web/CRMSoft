"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StripeGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeGatewayService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const app_error_1 = require("../../../../common/errors/app-error");
let StripeGatewayService = StripeGatewayService_1 = class StripeGatewayService {
    constructor() {
        this.logger = new common_1.Logger(StripeGatewayService_1.name);
    }
    async createOrder(credentials, amountInSmallestUnit, currency, metadata = {}) {
        const params = new URLSearchParams();
        params.set('amount', String(amountInSmallestUnit));
        params.set('currency', currency.toLowerCase());
        params.set('payment_method_types[]', 'card');
        Object.entries(metadata).forEach(([k, v]) => params.set(`metadata[${k}]`, v));
        const response = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${credentials.secretKey}`,
            },
            body: params.toString(),
        });
        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`Stripe PaymentIntent creation failed: ${body}`);
            throw app_error_1.AppError.from('PAYMENT_GATEWAY_ERROR');
        }
        const intent = await response.json();
        return {
            orderId: intent.id,
            amount: intent.amount / 100,
            currency: intent.currency.toUpperCase(),
            gateway: 'STRIPE',
            meta: { clientSecret: intent.client_secret, publishableKey: credentials.publishableKey },
        };
    }
    async verifyPayment(credentials, paymentIntentId) {
        const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
            headers: {
                Authorization: `Bearer ${credentials.secretKey}`,
            },
        });
        if (!response.ok) {
            throw app_error_1.AppError.from('PAYMENT_GATEWAY_ERROR');
        }
        const intent = await response.json();
        const verified = intent.status === 'succeeded';
        return {
            verified,
            paymentId: intent.latest_charge || intent.id,
            orderId: intent.id,
        };
    }
    verifyWebhookSignature(webhookSecret, payload, signatureHeader) {
        const parts = signatureHeader.split(',').reduce((acc, part) => {
            const [key, value] = part.split('=');
            acc[key] = value;
            return acc;
        }, {});
        const timestamp = parts['t'];
        const signature = parts['v1'];
        if (!timestamp || !signature)
            return false;
        const signedPayload = `${timestamp}.${payload}`;
        const expected = (0, crypto_1.createHmac)('sha256', webhookSecret)
            .update(signedPayload)
            .digest('hex');
        try {
            return (0, crypto_1.timingSafeEqual)(Buffer.from(expected), Buffer.from(signature));
        }
        catch {
            return false;
        }
    }
    async createRefund(credentials, chargeId, amountInSmallestUnit, reason) {
        const params = new URLSearchParams();
        params.set('charge', chargeId);
        params.set('amount', String(amountInSmallestUnit));
        if (reason)
            params.set('reason', 'requested_by_customer');
        const response = await fetch('https://api.stripe.com/v1/refunds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${credentials.secretKey}`,
            },
            body: params.toString(),
        });
        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`Stripe refund failed: ${body}`);
            throw app_error_1.AppError.from('PAYMENT_GATEWAY_ERROR');
        }
        const refund = await response.json();
        return {
            refundId: refund.id,
            status: refund.status,
            amount: refund.amount / 100,
        };
    }
};
exports.StripeGatewayService = StripeGatewayService;
exports.StripeGatewayService = StripeGatewayService = StripeGatewayService_1 = __decorate([
    (0, common_1.Injectable)()
], StripeGatewayService);
//# sourceMappingURL=stripe-gateway.service.js.map