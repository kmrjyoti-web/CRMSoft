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
var PaymentGatewayFactoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayFactoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const razorpay_gateway_service_1 = require("./razorpay-gateway.service");
const stripe_gateway_service_1 = require("./stripe-gateway.service");
let PaymentGatewayFactoryService = PaymentGatewayFactoryService_1 = class PaymentGatewayFactoryService {
    constructor(prisma, razorpay, stripe) {
        this.prisma = prisma;
        this.razorpay = razorpay;
        this.stripe = stripe;
        this.logger = new common_1.Logger(PaymentGatewayFactoryService_1.name);
    }
    async getCredentials(tenantId, gateway) {
        const provider = gateway === 'RAZORPAY' ? 'RAZORPAY' : 'STRIPE';
        const credential = await this.prisma.tenantCredential.findFirst({
            where: { tenantId, provider, status: 'ACTIVE' },
        });
        if (!credential) {
            throw app_error_1.AppError.from('PAYMENT_GATEWAY_NOT_CONFIGURED');
        }
        try {
            return JSON.parse(credential.encryptedData);
        }
        catch {
            throw app_error_1.AppError.from('PAYMENT_GATEWAY_ERROR');
        }
    }
    async createOrder(tenantId, gateway, amount, currency, receiptId, metadata = {}) {
        const creds = await this.getCredentials(tenantId, gateway);
        if (gateway === 'RAZORPAY') {
            return this.razorpay.createOrder(creds, Math.round(amount * 100), currency, receiptId, metadata);
        }
        return this.stripe.createOrder(creds, Math.round(amount * 100), currency, metadata);
    }
    async verifyPayment(tenantId, gateway, orderId, paymentId, signature) {
        const creds = await this.getCredentials(tenantId, gateway);
        if (gateway === 'RAZORPAY') {
            return this.razorpay.verifySignature(creds, orderId, paymentId, signature);
        }
        return this.stripe.verifyPayment(creds, orderId);
    }
    async initiateRefund(tenantId, gateway, paymentId, amount, reason) {
        const creds = await this.getCredentials(tenantId, gateway);
        if (gateway === 'RAZORPAY') {
            return this.razorpay.createRefund(creds, paymentId, Math.round(amount * 100), { reason: reason || 'Customer requested' });
        }
        return this.stripe.createRefund(creds, paymentId, Math.round(amount * 100), reason);
    }
};
exports.PaymentGatewayFactoryService = PaymentGatewayFactoryService;
exports.PaymentGatewayFactoryService = PaymentGatewayFactoryService = PaymentGatewayFactoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        razorpay_gateway_service_1.RazorpayGatewayService,
        stripe_gateway_service_1.StripeGatewayService])
], PaymentGatewayFactoryService);
//# sourceMappingURL=payment-gateway-factory.service.js.map