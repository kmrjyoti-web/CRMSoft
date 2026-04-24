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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const billing_service_1 = require("../billing/billing.service");
const audit_service_1 = require("../audit/audit.service");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    billing;
    audit;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(prisma, billing, audit) {
        this.prisma = prisma;
        this.billing = billing;
        this.audit = audit;
    }
    verifyRazorpaySignature(rawBody, signature) {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
        if (!secret) {
            this.logger.warn('RAZORPAY_WEBHOOK_SECRET not configured');
            return false;
        }
        const expected = (0, crypto_1.createHmac)('sha256', secret).update(rawBody).digest('hex');
        return expected === signature;
    }
    async handleRazorpayEvent(rawBody, signature) {
        const isVerified = this.verifyRazorpaySignature(rawBody, signature);
        const payload = JSON.parse(rawBody.toString('utf8'));
        const eventType = payload?.event ?? 'unknown';
        const event = await this.prisma.webhookEvent.create({
            data: {
                source: 'razorpay',
                eventType,
                payload,
                signature,
                isVerified,
                processingStatus: 'PENDING',
            },
        });
        if (!isVerified) {
            await this.prisma.webhookEvent.update({
                where: { id: event.id },
                data: { processingStatus: 'FAILED', errorMessage: 'Signature verification failed' },
            });
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        try {
            await this.processRazorpayEvent(eventType, payload);
            await this.prisma.webhookEvent.update({
                where: { id: event.id },
                data: { processingStatus: 'PROCESSED', processedAt: new Date() },
            });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.error(`Webhook processing failed for event ${eventType}: ${msg}`);
            await this.prisma.webhookEvent.update({
                where: { id: event.id },
                data: { processingStatus: 'FAILED', errorMessage: msg },
            });
        }
    }
    async processRazorpayEvent(eventType, payload) {
        switch (eventType) {
            case 'payment.captured':
                await this.onPaymentCaptured(payload);
                break;
            case 'payment.failed':
                await this.onPaymentFailed(payload);
                break;
            case 'refund.created':
                await this.onRefundCreated(payload);
                break;
            default:
                this.logger.log(`Unhandled Razorpay event: ${eventType}`);
        }
    }
    async onPaymentCaptured(payload) {
        const payment = payload?.payload?.payment;
        const entity = payment?.entity ?? {};
        const razorpayPaymentId = entity.id;
        const notes = entity.notes ?? {};
        const invoiceId = notes.invoiceId;
        if (!invoiceId) {
            this.logger.warn(`payment.captured: no invoiceId in notes for payment ${razorpayPaymentId}`);
            return;
        }
        await this.billing.markPaid(invoiceId, razorpayPaymentId);
        await this.audit.log({
            action: 'RAZORPAY_PAYMENT_CAPTURED',
            performedBy: 'razorpay_webhook',
            performedByRole: 'SYSTEM',
            details: { razorpayPaymentId, invoiceId },
        });
        this.logger.log(`Invoice ${invoiceId} marked PAID via Razorpay payment ${razorpayPaymentId}`);
    }
    async onPaymentFailed(payload) {
        const payment = payload?.payload?.payment;
        const entity = payment?.entity ?? {};
        const razorpayPaymentId = entity.id;
        const errorDesc = entity.error_description ?? 'Unknown error';
        await this.audit.log({
            action: 'RAZORPAY_PAYMENT_FAILED',
            performedBy: 'razorpay_webhook',
            performedByRole: 'SYSTEM',
            details: { razorpayPaymentId, error: errorDesc },
        });
        this.logger.warn(`Razorpay payment failed: ${razorpayPaymentId} — ${errorDesc}`);
    }
    async onRefundCreated(payload) {
        const refund = payload?.payload?.refund;
        const entity = refund?.entity ?? {};
        const refundId = entity.id;
        const amount = entity.amount;
        await this.audit.log({
            action: 'RAZORPAY_REFUND_CREATED',
            performedBy: 'razorpay_webhook',
            performedByRole: 'SYSTEM',
            details: { refundId, amount },
        });
        this.logger.log(`Razorpay refund created: ${refundId} for ₹${amount}`);
    }
    async getEvents(params) {
        const { page = 1, limit = 20, status, source } = params;
        const where = {};
        if (status)
            where.processingStatus = status;
        if (source)
            where.source = source;
        const [data, total] = await Promise.all([
            this.prisma.webhookEvent.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.webhookEvent.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getDashboard() {
        const [total, processed, failed, pending, last24h] = await Promise.all([
            this.prisma.webhookEvent.count(),
            this.prisma.webhookEvent.count({ where: { processingStatus: 'PROCESSED' } }),
            this.prisma.webhookEvent.count({ where: { processingStatus: 'FAILED' } }),
            this.prisma.webhookEvent.count({ where: { processingStatus: 'PENDING' } }),
            this.prisma.webhookEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
        ]);
        const successRate = total > 0 ? Math.round((processed / total) * 100) : 100;
        return { total, processed, failed, pending, last24h, successRate };
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        billing_service_1.BillingService,
        audit_service_1.AuditService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map