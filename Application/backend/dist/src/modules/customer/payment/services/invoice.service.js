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
var InvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const gst_calculator_service_1 = require("./gst-calculator.service");
const amount_in_words_service_1 = require("./amount-in-words.service");
const auto_number_service_1 = require("../../../core/identity/settings/services/auto-number.service");
const company_profile_service_1 = require("../../../core/identity/settings/services/company-profile.service");
const cross_service_decorator_1 = require("../../../../common/decorators/cross-service.decorator");
let InvoiceService = InvoiceService_1 = class InvoiceService {
    constructor(prisma, gstCalculator, amountInWords, autoNumber, companyProfile) {
        this.prisma = prisma;
        this.gstCalculator = gstCalculator;
        this.amountInWords = amountInWords;
        this.autoNumber = autoNumber;
        this.companyProfile = companyProfile;
        this.logger = new common_1.Logger(InvoiceService_1.name);
    }
    async generateFromQuotation(tenantId, dto, userId) {
        const quotation = await this.prisma.working.quotation.findFirst({
            where: { id: dto.quotationId, tenantId },
            include: { lineItems: true },
        });
        if (!quotation)
            throw app_error_1.AppError.from('QUOTATION_NOT_FOUND');
        const [contact, org] = await Promise.all([
            quotation.contactPersonId
                ? this.prisma.working.contact.findUnique({ where: { id: quotation.contactPersonId } })
                : null,
            quotation.organizationId
                ? this.prisma.working.organization.findUnique({ where: { id: quotation.organizationId } })
                : null,
        ]);
        const seller = await this.companyProfile.getPublic(tenantId);
        const isInterState = dto.isInterState ??
            this.gstCalculator.isInterStateByName(seller.state || null, org?.city || null);
        const gstLines = quotation.lineItems.map((li) => ({
            quantity: Number(li.quantity),
            unitPrice: Number(li.unitPrice),
            discountType: li.discountType || undefined,
            discountValue: li.discountValue ? Number(li.discountValue) : undefined,
            gstRate: li.gstRate ? Number(li.gstRate) : undefined,
            cessRate: li.cessRate ? Number(li.cessRate) : undefined,
        }));
        const gst = this.gstCalculator.calculate(gstLines, isInterState, quotation.discountType || undefined, quotation.discountValue ? Number(quotation.discountValue) : undefined);
        const invoiceNo = await this.autoNumber.next(tenantId, 'Invoice');
        const amountWords = this.amountInWords.convert(gst.totalAmount);
        const invoice = await this.prisma.working.invoice.create({
            data: {
                tenantId,
                invoiceNo,
                quotationId: quotation.id,
                leadId: quotation.leadId,
                contactId: quotation.contactPersonId,
                organizationId: quotation.organizationId,
                billingName: contact?.firstName
                    ? `${contact.firstName} ${contact.lastName || ''}`.trim()
                    : org?.name || 'N/A',
                billingGstNumber: null,
                sellerName: seller.companyName || '',
                sellerAddress: seller.addressLine1 || null,
                sellerCity: seller.city || null,
                sellerState: seller.state || null,
                sellerPincode: seller.pincode || null,
                sellerGstNumber: seller.gstNumber || null,
                sellerPanNumber: seller.panNumber || null,
                invoiceDate: dto.dueDate ? new Date() : new Date(),
                dueDate: new Date(dto.dueDate),
                subtotal: gst.subtotal,
                discountType: quotation.discountType,
                discountValue: quotation.discountValue ? Number(quotation.discountValue) : 0,
                discountAmount: gst.discountAmount,
                taxableAmount: gst.taxableAmount,
                cgstAmount: gst.cgstAmount,
                sgstAmount: gst.sgstAmount,
                igstAmount: gst.igstAmount,
                cessAmount: gst.cessAmount,
                totalTax: gst.totalTax,
                roundOff: gst.roundOff,
                totalAmount: gst.totalAmount,
                amountInWords: amountWords,
                balanceAmount: gst.totalAmount,
                isInterState,
                bankName: seller.bankName || null,
                bankBranch: seller.bankBranch || null,
                accountNumber: seller.accountNumber || null,
                ifscCode: seller.ifscCode || null,
                upiId: seller.upiId || null,
                notes: dto.notes,
                termsAndConditions: dto.termsAndConditions,
                createdById: userId,
                lineItems: {
                    create: quotation.lineItems.map((li, idx) => ({
                        tenantId,
                        productId: li.productId,
                        productCode: li.productCode,
                        productName: li.productName,
                        description: li.description,
                        hsnCode: li.hsnCode,
                        quantity: Number(li.quantity),
                        unit: li.unit,
                        unitPrice: Number(li.unitPrice),
                        mrp: li.mrp ? Number(li.mrp) : null,
                        discountType: li.discountType,
                        discountValue: li.discountValue ? Number(li.discountValue) : null,
                        discountAmount: gst.lines[idx].discountAmount,
                        lineTotal: gst.lines[idx].lineTotal,
                        gstRate: li.gstRate ? Number(li.gstRate) : null,
                        cgstAmount: gst.lines[idx].cgstAmount,
                        sgstAmount: gst.lines[idx].sgstAmount,
                        igstAmount: gst.lines[idx].igstAmount,
                        cessRate: li.cessRate ? Number(li.cessRate) : null,
                        cessAmount: gst.lines[idx].cessAmount,
                        taxAmount: gst.lines[idx].taxAmount,
                        totalWithTax: gst.lines[idx].totalWithTax,
                        sortOrder: li.sortOrder,
                        notes: li.notes,
                    })),
                },
            },
            include: { lineItems: true },
        });
        this.logger.log(`Invoice ${invoiceNo} generated from quotation ${quotation.quotationNo}`);
        return invoice;
    }
    async create(tenantId, dto, userId) {
        const seller = await this.companyProfile.getPublic(tenantId);
        const isInterState = dto.isInterState ??
            this.gstCalculator.isInterStateByName(seller.state || null, dto.billingState || null);
        const gstLines = dto.lineItems.map((li) => ({
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            discountType: li.discountType,
            discountValue: li.discountValue,
            gstRate: li.gstRate,
            cessRate: li.cessRate,
        }));
        const gst = this.gstCalculator.calculate(gstLines, isInterState, dto.discountType, dto.discountValue);
        const invoiceNo = await this.autoNumber.next(tenantId, 'Invoice');
        const amountWords = this.amountInWords.convert(gst.totalAmount);
        const invoice = await this.prisma.working.invoice.create({
            data: {
                tenantId,
                invoiceNo,
                quotationId: dto.quotationId,
                leadId: dto.leadId,
                contactId: dto.contactId,
                organizationId: dto.organizationId,
                billingName: dto.billingName,
                billingAddress: dto.billingAddress,
                billingCity: dto.billingCity,
                billingState: dto.billingState,
                billingPincode: dto.billingPincode,
                billingGstNumber: dto.billingGstNumber,
                shippingName: dto.shippingName,
                shippingAddress: dto.shippingAddress,
                shippingCity: dto.shippingCity,
                shippingState: dto.shippingState,
                shippingPincode: dto.shippingPincode,
                sellerName: seller.companyName || '',
                sellerAddress: seller.addressLine1 || null,
                sellerCity: seller.city || null,
                sellerState: seller.state || null,
                sellerPincode: seller.pincode || null,
                sellerGstNumber: seller.gstNumber || null,
                sellerPanNumber: seller.panNumber || null,
                invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
                dueDate: new Date(dto.dueDate),
                supplyDate: dto.supplyDate ? new Date(dto.supplyDate) : null,
                subtotal: gst.subtotal,
                discountType: dto.discountType,
                discountValue: dto.discountValue || 0,
                discountAmount: gst.discountAmount,
                taxableAmount: gst.taxableAmount,
                cgstAmount: gst.cgstAmount,
                sgstAmount: gst.sgstAmount,
                igstAmount: gst.igstAmount,
                cessAmount: gst.cessAmount,
                totalTax: gst.totalTax,
                roundOff: gst.roundOff,
                totalAmount: gst.totalAmount,
                amountInWords: amountWords,
                balanceAmount: gst.totalAmount,
                isInterState,
                bankName: seller.bankName || null,
                bankBranch: seller.bankBranch || null,
                accountNumber: seller.accountNumber || null,
                ifscCode: seller.ifscCode || null,
                upiId: seller.upiId || null,
                notes: dto.notes,
                termsAndConditions: dto.termsAndConditions,
                internalNotes: dto.internalNotes,
                createdById: userId,
                lineItems: {
                    create: dto.lineItems.map((li, idx) => ({
                        tenantId,
                        productId: li.productId,
                        productCode: li.productCode,
                        productName: li.productName,
                        description: li.description,
                        hsnCode: li.hsnCode,
                        quantity: li.quantity,
                        unit: li.unit,
                        unitPrice: li.unitPrice,
                        mrp: li.mrp,
                        discountType: li.discountType,
                        discountValue: li.discountValue,
                        discountAmount: gst.lines[idx].discountAmount,
                        lineTotal: gst.lines[idx].lineTotal,
                        gstRate: li.gstRate,
                        cgstAmount: gst.lines[idx].cgstAmount,
                        sgstAmount: gst.lines[idx].sgstAmount,
                        igstAmount: gst.lines[idx].igstAmount,
                        cessRate: li.cessRate,
                        cessAmount: gst.lines[idx].cessAmount,
                        taxAmount: gst.lines[idx].taxAmount,
                        totalWithTax: gst.lines[idx].totalWithTax,
                        sortOrder: li.sortOrder || idx,
                        notes: li.notes,
                    })),
                },
            },
            include: { lineItems: true },
        });
        return invoice;
    }
    async getById(tenantId, invoiceId) {
        const invoice = await this.prisma.working.invoice.findFirst({
            where: { id: invoiceId, tenantId },
            include: { lineItems: true, payments: true, creditNotes: true, reminders: true },
        });
        if (!invoice)
            throw app_error_1.AppError.from('INVOICE_NOT_FOUND');
        return invoice;
    }
    async list(tenantId, query) {
        const where = { tenantId };
        if (query.status)
            where.status = query.status;
        if (query.leadId)
            where.leadId = query.leadId;
        if (query.contactId)
            where.contactId = query.contactId;
        if (query.organizationId)
            where.organizationId = query.organizationId;
        if (query.fromDate || query.toDate) {
            where.invoiceDate = {};
            if (query.fromDate)
                where.invoiceDate.gte = new Date(query.fromDate);
            if (query.toDate)
                where.invoiceDate.lte = new Date(query.toDate);
        }
        const page = query.page || 1;
        const limit = query.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.invoice.findMany({
                where,
                include: { lineItems: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.invoice.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async update(tenantId, invoiceId, dto) {
        const invoice = await this.prisma.working.invoice.findFirst({
            where: { id: invoiceId, tenantId },
        });
        if (!invoice)
            throw app_error_1.AppError.from('INVOICE_NOT_FOUND');
        if (invoice.status !== 'DRAFT') {
            throw app_error_1.AppError.from('INVOICE_CANCELLED');
        }
        return this.prisma.working.invoice.update({
            where: { id: invoiceId },
            data: dto,
            include: { lineItems: true },
        });
    }
    async send(tenantId, invoiceId) {
        const invoice = await this.prisma.working.invoice.findFirst({
            where: { id: invoiceId, tenantId },
        });
        if (!invoice)
            throw app_error_1.AppError.from('INVOICE_NOT_FOUND');
        return this.prisma.working.invoice.update({
            where: { id: invoiceId },
            data: { status: 'SENT' },
        });
    }
    async cancel(tenantId, invoiceId, reason, userId) {
        const invoice = await this.prisma.working.invoice.findFirst({
            where: { id: invoiceId, tenantId },
        });
        if (!invoice)
            throw app_error_1.AppError.from('INVOICE_NOT_FOUND');
        if (invoice.status === 'PAID')
            throw app_error_1.AppError.from('INVOICE_ALREADY_PAID');
        return this.prisma.working.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancelledById: userId,
                cancelReason: reason,
            },
        });
    }
    async markOverdue(tenantId) {
        const now = new Date();
        const result = await this.prisma.working.invoice.updateMany({
            where: {
                tenantId,
                status: { in: ['SENT', 'PARTIALLY_PAID'] },
                dueDate: { lt: now },
            },
            data: { status: 'OVERDUE' },
        });
        this.logger.log(`Marked ${result.count} invoices as overdue for tenant ${tenantId}`);
        return result.count;
    }
    async recalculateBalance(invoiceId) {
        const payments = await this.prisma.working.payment.findMany({
            where: { invoiceId, status: { in: ['CAPTURED', 'PAID'] } },
        });
        const refunds = await this.prisma.working.refund.findMany({
            where: {
                payment: { invoiceId },
                status: 'REFUND_PROCESSED',
            },
        });
        const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalRefunded = refunds.reduce((sum, r) => sum + Number(r.amount), 0);
        const creditNotes = await this.prisma.working.creditNote.findMany({
            where: { invoiceId, status: 'CN_APPLIED' },
        });
        const totalCredits = creditNotes.reduce((sum, cn) => sum + Number(cn.appliedAmount || 0), 0);
        const netPaid = totalPaid - totalRefunded + totalCredits;
        const invoice = await this.prisma.working.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice)
            return;
        const total = Number(invoice.totalAmount);
        const balance = Math.max(0, total - netPaid);
        let status = invoice.status;
        if (balance <= 0) {
            status = 'PAID';
        }
        else if (netPaid > 0 && balance > 0) {
            status = 'PARTIALLY_PAID';
        }
        await this.prisma.working.invoice.update({
            where: { id: invoiceId },
            data: {
                paidAmount: netPaid,
                balanceAmount: balance,
                status,
            },
        });
    }
    async getAnalytics(tenantId) {
        const [totalInvoices, statusCounts, totalRevenue] = await Promise.all([
            this.prisma.working.invoice.count({ where: { tenantId } }),
            this.prisma.working.invoice.groupBy({
                by: ['status'],
                where: { tenantId },
                _count: true,
                _sum: { totalAmount: true, balanceAmount: true },
            }),
            this.prisma.working.invoice.aggregate({
                where: { tenantId, status: 'PAID' },
                _sum: { totalAmount: true },
            }),
        ]);
        const overdueAmount = await this.prisma.working.invoice.aggregate({
            where: { tenantId, status: 'OVERDUE' },
            _sum: { balanceAmount: true },
        });
        return {
            totalInvoices,
            statusBreakdown: statusCounts.map((s) => ({
                status: s.status,
                count: s._count,
                totalAmount: Number(s._sum.totalAmount || 0),
                balanceAmount: Number(s._sum.balanceAmount || 0),
            })),
            totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
            totalOverdueAmount: Number(overdueAmount._sum.balanceAmount || 0),
        };
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = InvoiceService_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses AutoNumberService (invoice numbering sequences) and CompanyProfileService (seller details on PDF) from identity settings'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gst_calculator_service_1.GstCalculatorService,
        amount_in_words_service_1.AmountInWordsService,
        auto_number_service_1.AutoNumberService,
        company_profile_service_1.CompanyProfileService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map