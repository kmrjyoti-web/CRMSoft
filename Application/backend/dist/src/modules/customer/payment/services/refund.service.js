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
var RefundService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const auto_number_service_1 = require("../../../core/identity/settings/services/auto-number.service");
const cross_service_decorator_1 = require("../../../../common/decorators/cross-service.decorator");
const payment_gateway_factory_service_1 = require("./payment-gateway-factory.service");
const invoice_service_1 = require("./invoice.service");
const error_utils_1 = require("../../../../common/utils/error.utils");
let RefundService = RefundService_1 = class RefundService {
    constructor(prisma, autoNumber, gatewayFactory, invoiceService) {
        this.prisma = prisma;
        this.autoNumber = autoNumber;
        this.gatewayFactory = gatewayFactory;
        this.invoiceService = invoiceService;
        this.logger = new common_1.Logger(RefundService_1.name);
    }
    async create(tenantId, dto, userId) {
        const payment = await this.prisma.working.payment.findFirst({
            where: { id: dto.paymentId, tenantId },
            include: { refunds: true },
        });
        if (!payment)
            throw app_error_1.AppError.from('PAYMENT_NOT_FOUND');
        const totalRefunded = payment.refunds
            .filter((r) => r.status !== 'REFUND_CANCELLED')
            .reduce((sum, r) => sum + Number(r.amount), 0);
        const availableForRefund = Number(payment.amount) - totalRefunded;
        if (dto.amount > availableForRefund)
            throw app_error_1.AppError.from('REFUND_EXCEEDS_PAYMENT');
        const refundNo = await this.autoNumber.next(tenantId, 'Refund');
        let gatewayRefundId = null;
        let gatewayResponse = null;
        let status = 'REFUND_PENDING';
        if (payment.gateway !== 'MANUAL' && payment.gatewayPaymentId) {
            try {
                const result = await this.gatewayFactory.initiateRefund(tenantId, payment.gateway, payment.gatewayPaymentId, dto.amount, dto.reason);
                gatewayRefundId = result.refundId;
                if (result.status === 'processed' || result.status === 'succeeded') {
                    status = 'REFUND_PROCESSED';
                }
            }
            catch (err) {
                this.logger.error(`Gateway refund failed: ${(0, error_utils_1.getErrorMessage)(err)}`);
            }
        }
        else {
            status = 'REFUND_PROCESSED';
        }
        const refund = await this.prisma.working.refund.create({
            data: {
                tenantId,
                refundNo,
                paymentId: dto.paymentId,
                amount: dto.amount,
                reason: dto.reason,
                status,
                gatewayRefundId,
                gatewayResponse,
                processedAt: status === 'REFUND_PROCESSED' ? new Date() : null,
                processedById: status === 'REFUND_PROCESSED' ? userId : null,
                createdById: userId,
            },
        });
        if (totalRefunded + dto.amount >= Number(payment.amount)) {
            await this.prisma.working.payment.update({
                where: { id: payment.id },
                data: { status: 'REFUNDED' },
            });
        }
        else {
            await this.prisma.working.payment.update({
                where: { id: payment.id },
                data: { status: 'PARTIALLY_REFUNDED' },
            });
        }
        await this.invoiceService.recalculateBalance(payment.invoiceId);
        this.logger.log(`Refund ${refundNo} created for payment ${payment.paymentNo}`);
        return refund;
    }
    async getById(tenantId, refundId) {
        const refund = await this.prisma.working.refund.findFirst({
            where: { id: refundId, tenantId },
            include: { payment: { include: { invoice: true } } },
        });
        if (!refund)
            throw app_error_1.AppError.from('REFUND_NOT_FOUND');
        return refund;
    }
    async list(tenantId, query) {
        const where = { tenantId };
        if (query.paymentId)
            where.paymentId = query.paymentId;
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
            this.prisma.working.refund.findMany({
                where,
                include: { payment: { select: { paymentNo: true, invoice: { select: { invoiceNo: true } } } } },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.refund.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.RefundService = RefundService;
exports.RefundService = RefundService = RefundService_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses AutoNumberService from identity settings to generate refund reference numbers'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auto_number_service_1.AutoNumberService,
        payment_gateway_factory_service_1.PaymentGatewayFactoryService,
        invoice_service_1.InvoiceService])
], RefundService);
//# sourceMappingURL=refund.service.js.map