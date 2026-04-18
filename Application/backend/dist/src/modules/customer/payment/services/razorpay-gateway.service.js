"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RazorpayGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayGatewayService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const app_error_1 = require("../../../../common/errors/app-error");
let RazorpayGatewayService = RazorpayGatewayService_1 = class RazorpayGatewayService {
    constructor() {
        this.logger = new common_1.Logger(RazorpayGatewayService_1.name);
    }
    async createOrder(credentials, amountInPaise, currency, receiptId, notes = {}) {
        const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency,
                receipt: receiptId,
                notes,
            }),
        });
        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`Razorpay order creation failed: ${body}`);
            throw app_error_1.AppError.from('PAYMENT_GATEWAY_ERROR');
        }
        const order = await response.json();
        return {
            orderId: order.id,
            amount: order.amount / 100,
            currency: order.currency,
            gateway: 'RAZORPAY',
            meta: { keyId: credentials.keyId, orderId: order.id },
        };
    }
    verifySignature(credentials, orderId, paymentId, signature) {
        const body = `${orderId}|${paymentId}`;
        const expectedSignature = (0, crypto_1.createHmac)('sha256', credentials.keySecret)
            .update(body)
            .digest('hex');
        const verified = expectedSignature === signature;
        if (!verified) {
            this.logger.warn(`Razorpay signature mismatch for order ${orderId}`);
        }
        return { verified, paymentId, orderId };
    }
    verifyWebhookSignature(webhookSecret, body, signature) {
        const expectedSignature = (0, crypto_1.createHmac)('sha256', webhookSecret)
            .update(body)
            .digest('hex');
        return expectedSignature === signature;
    }
    async createRefund(credentials, paymentId, amountInPaise, notes = {}) {
        const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString('base64');
        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
                amount: amountInPaise,
                notes,
            }),
        });
        if (!response.ok) {
            const body = await response.text();
            this.logger.error(`Razorpay refund failed: ${body}`);
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
exports.RazorpayGatewayService = RazorpayGatewayService;
exports.RazorpayGatewayService = RazorpayGatewayService = RazorpayGatewayService_1 = __decorate([
    (0, common_1.Injectable)()
], RazorpayGatewayService);
//# sourceMappingURL=razorpay-gateway.service.js.map