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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const auto_number_service_1 = require("../../../core/identity/settings/services/auto-number.service");
const cross_service_decorator_1 = require("../../../../common/decorators/cross-service.decorator");
const payment_gateway_factory_service_1 = require("./payment-gateway-factory.service");
const invoice_service_1 = require("./invoice.service");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(prisma, autoNumber, gatewayFactory, invoiceService) {
        this.prisma = prisma;
        this.autoNumber = autoNumber;
        this.gatewayFactory = gatewayFactory;
        this.invoiceService = invoiceService;
        this.logger = new common_1.Logger(PaymentService_1.name);
    }
    async recordPayment(tenantId, dto, userId) {
        const invoice = await this.prisma.working.invoice.findFirst({
            where: { id: dto.invoiceId, tenantId },
        });
        if (!invoice)
            throw app_error_1.AppError.from('INVOICE_NOT_FOUND');
        if (invoice.status === 'CANCELLED')
            throw app_error_1.AppError.from('INVOICE_CANCELLED');
        if (invoice.status === 'VOID')
            throw app_error_1.AppError.from('INVOICE_VOID');
        const balance = Number(invoice.balanceAmount);
        if (dto.amount > balance)
            throw app_error_1.AppError.from('PAYMENT_EXCEEDS_BALANCE');
        const paymentNo = await this.autoNumber.next(tenantId, 'Payment');
        const payment = await this.prisma.working.payment.create({
            data: {
                tenantId,
                paymentNo,
                invoiceId: dto.invoiceId,
                amount: dto.amount,
                status: 'CAPTURED',
                method: dto.method,
                gateway: dto.gateway || 'MANUAL',
                chequeNumber: dto.chequeNumber,
                chequeDate: dto.chequeDate ? new Date(dto.chequeDate) : null,
                chequeBankName: dto.chequeBankName,
                transactionRef: dto.transactionRef,
                upiTransactionId: dto.upiTransactionId,
                notes: dto.notes,
                paidAt: new Date(),
                recordedById: userId,
            },
        });
        await this.invoiceService.recalculateBalance(dto.invoiceId);
        this.logger.log(`Payment ${paymentNo} recorded for invoice ${invoice.invoiceNo}`);
        return payment;
    }
    async createGatewayOrder(tenantId, dto, userId) {
        const invoice = await this.prisma.working.invoice.findFirst({
            where: { id: dto.invoiceId, tenantId },
        });
        if (!invoice)
            throw app_error_1.AppError.from('INVOICE_NOT_FOUND');
        if (invoice.status === 'CANCELLED')
            throw app_error_1.AppError.from('INVOICE_CANCELLED');
        const balance = Number(invoice.balanceAmount);
        if (dto.amount > balance)
            throw app_error_1.AppError.from('PAYMENT_EXCEEDS_BALANCE');
        const paymentNo = await this.autoNumber.next(tenantId, 'Payment');
        const gatewayOrder = await this.gatewayFactory.createOrder(tenantId, dto.gateway, dto.amount, 'INR', paymentNo, { invoiceId: dto.invoiceId, tenantId });
        const payment = await this.prisma.working.payment.create({
            data: {
                tenantId,
                paymentNo,
                invoiceId: dto.invoiceId,
                amount: dto.amount,
                status: 'PENDING',
                method: dto.gateway === 'RAZORPAY' ? 'RAZORPAY' : 'STRIPE',
                gateway: dto.gateway,
                gatewayOrderId: gatewayOrder.orderId,
                recordedById: userId,
            },
        });
        return {
            payment,
            gatewayOrder,
        };
    }
    async verifyGatewayPayment(tenantId, dto) {
        const payment = await this.prisma.working.payment.findFirst({
            where: { gatewayOrderId: dto.gatewayOrderId, tenantId },
        });
        if (!payment)
            throw app_error_1.AppError.from('PAYMENT_NOT_FOUND');
        if (payment.status === 'CAPTURED')
            throw app_error_1.AppError.from('PAYMENT_ALREADY_CAPTURED');
        const result = await this.gatewayFactory.verifyPayment(tenantId, payment.gateway, dto.gatewayOrderId, dto.gatewayPaymentId, dto.gatewaySignature);
        if (!result.verified) {
            await this.prisma.working.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'FAILED',
                    failureReason: 'Signature verification failed',
                    gatewayPaymentId: dto.gatewayPaymentId,
                },
            });
            throw app_error_1.AppError.from('PAYMENT_SIGNATURE_INVALID');
        }
        const updated = await this.prisma.working.payment.update({
            where: { id: payment.id },
            data: {
                status: 'CAPTURED',
                gatewayPaymentId: dto.gatewayPaymentId,
                gatewaySignature: dto.gatewaySignature,
                paidAt: new Date(),
            },
        });
        await this.invoiceService.recalculateBalance(payment.invoiceId);
        this.logger.log(`Payment ${payment.paymentNo} verified and captured`);
        return updated;
    }
    async getById(tenantId, paymentId) {
        const payment = await this.prisma.working.payment.findFirst({
            where: { id: paymentId, tenantId },
            include: { invoice: true, receipt: true, refunds: true },
        });
        if (!payment)
            throw app_error_1.AppError.from('PAYMENT_NOT_FOUND');
        return payment;
    }
    async list(tenantId, query) {
        const where = { tenantId };
        if (query.invoiceId)
            where.invoiceId = query.invoiceId;
        if (query.leadId)
            where.invoice = { leadId: query.leadId };
        if (query.status)
            where.status = query.status;
        if (query.fromDate || query.toDate) {
            where.createdAt = {};
            if (query.fromDate)
                where.createdAt.gte = new Date(query.fromDate);
            if (query.toDate)
                where.createdAt.lte = new Date(query.toDate);
        }
        const page = query.page || 1;
        const limit = query.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.payment.findMany({
                where,
                include: { invoice: { select: { invoiceNo: true, billingName: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.payment.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async handleWebhook(tenantId, gateway, event, payload) {
        this.logger.log(`Webhook received: ${gateway} ${event}`);
        if (gateway === 'RAZORPAY') {
            return this.handleRazorpayWebhook(tenantId, event, payload);
        }
        return this.handleStripeWebhook(tenantId, event, payload);
    }
    async handleRazorpayWebhook(tenantId, event, payload) {
        if (event === 'payment.captured') {
            const rpPaymentId = payload.payment?.entity?.id;
            const rpOrderId = payload.payment?.entity?.order_id;
            if (rpOrderId) {
                const payment = await this.prisma.working.payment.findFirst({
                    where: { gatewayOrderId: rpOrderId, tenantId },
                });
                if (payment && payment.status === 'PENDING') {
                    await this.prisma.working.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'CAPTURED',
                            gatewayPaymentId: rpPaymentId,
                            gatewayResponse: payload,
                            paidAt: new Date(),
                        },
                    });
                    await this.invoiceService.recalculateBalance(payment.invoiceId);
                }
            }
        }
        if (event === 'refund.processed') {
            const rpRefundId = payload.refund?.entity?.id;
            if (rpRefundId) {
                await this.prisma.working.refund.updateMany({
                    where: { gatewayRefundId: rpRefundId },
                    data: { status: 'REFUND_PROCESSED', processedAt: new Date(), gatewayResponse: payload },
                });
            }
        }
    }
    async handleStripeWebhook(tenantId, event, payload) {
        if (event === 'payment_intent.succeeded') {
            const intentId = payload.data?.object?.id;
            if (intentId) {
                const payment = await this.prisma.working.payment.findFirst({
                    where: { gatewayOrderId: intentId, tenantId },
                });
                if (payment && payment.status === 'PENDING') {
                    await this.prisma.working.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'CAPTURED',
                            gatewayPaymentId: payload.data?.object?.latest_charge,
                            gatewayResponse: payload,
                            paidAt: new Date(),
                        },
                    });
                    await this.invoiceService.recalculateBalance(payment.invoiceId);
                }
            }
        }
        if (event === 'charge.refunded') {
            const chargeId = payload.data?.object?.id;
            if (chargeId) {
                const refund = payload.data?.object?.refunds?.data?.[0];
                if (refund) {
                    await this.prisma.working.refund.updateMany({
                        where: { gatewayRefundId: refund.id },
                        data: { status: 'REFUND_PROCESSED', processedAt: new Date(), gatewayResponse: payload },
                    });
                }
            }
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses AutoNumberService from identity settings to generate payment receipt numbers'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auto_number_service_1.AutoNumberService,
        payment_gateway_factory_service_1.PaymentGatewayFactoryService,
        invoice_service_1.InvoiceService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map