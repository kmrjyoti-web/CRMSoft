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
var ProformaInvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProformaInvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const gst_calculator_service_1 = require("./gst-calculator.service");
const amount_in_words_service_1 = require("./amount-in-words.service");
const auto_number_service_1 = require("../../../core/identity/settings/services/auto-number.service");
const company_profile_service_1 = require("../../../core/identity/settings/services/company-profile.service");
const cross_service_decorator_1 = require("../../../../common/decorators/cross-service.decorator");
const invoice_service_1 = require("./invoice.service");
let ProformaInvoiceService = ProformaInvoiceService_1 = class ProformaInvoiceService {
    constructor(prisma, gstCalculator, amountInWords, autoNumber, companyProfile, invoiceService) {
        this.prisma = prisma;
        this.gstCalculator = gstCalculator;
        this.amountInWords = amountInWords;
        this.autoNumber = autoNumber;
        this.companyProfile = companyProfile;
        this.invoiceService = invoiceService;
        this.logger = new common_1.Logger(ProformaInvoiceService_1.name);
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
        const proformaNo = await this.autoNumber.next(tenantId, 'ProformaInvoice');
        const amountWords = this.amountInWords.convert(gst.totalAmount);
        const proforma = await this.prisma.working.proformaInvoice.create({
            data: {
                tenantId,
                proformaNo,
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
                proformaDate: new Date(),
                validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
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
                isInterState,
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
        this.logger.log(`Proforma ${proformaNo} generated from quotation ${quotation.quotationNo}`);
        return proforma;
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
        const proformaNo = await this.autoNumber.next(tenantId, 'ProformaInvoice');
        const amountWords = this.amountInWords.convert(gst.totalAmount);
        const proforma = await this.prisma.working.proformaInvoice.create({
            data: {
                tenantId,
                proformaNo,
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
                sellerName: seller.companyName || '',
                sellerAddress: seller.addressLine1 || null,
                sellerCity: seller.city || null,
                sellerState: seller.state || null,
                sellerPincode: seller.pincode || null,
                sellerGstNumber: seller.gstNumber || null,
                sellerPanNumber: seller.panNumber || null,
                proformaDate: dto.proformaDate ? new Date(dto.proformaDate) : new Date(),
                validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
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
                isInterState,
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
        return proforma;
    }
    async getById(tenantId, id) {
        const proforma = await this.prisma.working.proformaInvoice.findFirst({
            where: { id, tenantId },
            include: { lineItems: true },
        });
        if (!proforma)
            throw app_error_1.AppError.from('PROFORMA_NOT_FOUND');
        return proforma;
    }
    async list(tenantId, query) {
        const where = { tenantId };
        if (query.status)
            where.status = query.status;
        if (query.contactId)
            where.contactId = query.contactId;
        if (query.organizationId)
            where.organizationId = query.organizationId;
        if (query.leadId)
            where.leadId = query.leadId;
        if (query.quotationId)
            where.quotationId = query.quotationId;
        if (query.fromDate || query.toDate) {
            where.proformaDate = {};
            if (query.fromDate)
                where.proformaDate.gte = new Date(query.fromDate);
            if (query.toDate)
                where.proformaDate.lte = new Date(query.toDate);
        }
        const page = query.page || 1;
        const limit = query.limit || 20;
        const [data, total] = await Promise.all([
            this.prisma.working.proformaInvoice.findMany({
                where,
                include: { lineItems: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.proformaInvoice.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async update(tenantId, id, dto) {
        const proforma = await this.prisma.working.proformaInvoice.findFirst({
            where: { id, tenantId },
        });
        if (!proforma)
            throw app_error_1.AppError.from('PROFORMA_NOT_FOUND');
        if (proforma.status !== 'PI_DRAFT') {
            throw app_error_1.AppError.from('PROFORMA_NOT_DRAFT');
        }
        return this.prisma.working.proformaInvoice.update({
            where: { id },
            data: dto,
            include: { lineItems: true },
        });
    }
    async send(tenantId, id) {
        const proforma = await this.prisma.working.proformaInvoice.findFirst({
            where: { id, tenantId },
        });
        if (!proforma)
            throw app_error_1.AppError.from('PROFORMA_NOT_FOUND');
        return this.prisma.working.proformaInvoice.update({
            where: { id },
            data: { status: 'PI_SENT' },
        });
    }
    async convertToInvoice(tenantId, id, userId) {
        const proforma = await this.prisma.working.proformaInvoice.findFirst({
            where: { id, tenantId },
            include: { lineItems: true },
        });
        if (!proforma)
            throw app_error_1.AppError.from('PROFORMA_NOT_FOUND');
        if (proforma.status === 'PI_CONVERTED') {
            throw app_error_1.AppError.from('PROFORMA_ALREADY_CONVERTED');
        }
        if (proforma.status === 'PI_CANCELLED') {
            throw app_error_1.AppError.from('PROFORMA_CANCELLED');
        }
        const seller = await this.companyProfile.getPublic(tenantId);
        const invoiceNo = await this.autoNumber.next(tenantId, 'Invoice');
        const amountWords = this.amountInWords.convert(Number(proforma.totalAmount));
        const invoice = await this.prisma.working.invoice.create({
            data: {
                tenantId,
                invoiceNo,
                quotationId: proforma.quotationId,
                leadId: proforma.leadId,
                contactId: proforma.contactId,
                organizationId: proforma.organizationId,
                billingName: proforma.billingName,
                billingAddress: proforma.billingAddress,
                billingCity: proforma.billingCity,
                billingState: proforma.billingState,
                billingPincode: proforma.billingPincode,
                billingGstNumber: proforma.billingGstNumber,
                sellerName: proforma.sellerName,
                sellerAddress: proforma.sellerAddress,
                sellerCity: proforma.sellerCity,
                sellerState: proforma.sellerState,
                sellerPincode: proforma.sellerPincode,
                sellerGstNumber: proforma.sellerGstNumber,
                sellerPanNumber: proforma.sellerPanNumber,
                invoiceDate: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                subtotal: proforma.subtotal,
                discountType: proforma.discountType,
                discountValue: proforma.discountValue,
                discountAmount: proforma.discountAmount,
                taxableAmount: proforma.taxableAmount,
                cgstAmount: proforma.cgstAmount,
                sgstAmount: proforma.sgstAmount,
                igstAmount: proforma.igstAmount,
                cessAmount: proforma.cessAmount,
                totalTax: proforma.totalTax,
                roundOff: proforma.roundOff,
                totalAmount: proforma.totalAmount,
                amountInWords: amountWords,
                balanceAmount: proforma.totalAmount,
                isInterState: proforma.isInterState,
                bankName: seller.bankName || null,
                bankBranch: seller.bankBranch || null,
                accountNumber: seller.accountNumber || null,
                ifscCode: seller.ifscCode || null,
                upiId: seller.upiId || null,
                notes: proforma.notes,
                termsAndConditions: proforma.termsAndConditions,
                internalNotes: proforma.internalNotes,
                createdById: userId,
                lineItems: {
                    create: proforma.lineItems.map((li) => ({
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
                        discountAmount: Number(li.discountAmount),
                        lineTotal: Number(li.lineTotal),
                        gstRate: li.gstRate ? Number(li.gstRate) : null,
                        cgstAmount: Number(li.cgstAmount),
                        sgstAmount: Number(li.sgstAmount),
                        igstAmount: Number(li.igstAmount),
                        cessRate: li.cessRate ? Number(li.cessRate) : null,
                        cessAmount: Number(li.cessAmount),
                        taxAmount: Number(li.taxAmount),
                        totalWithTax: Number(li.totalWithTax),
                        sortOrder: li.sortOrder,
                        notes: li.notes,
                    })),
                },
            },
            include: { lineItems: true },
        });
        await this.prisma.working.proformaInvoice.update({
            where: { id },
            data: {
                status: 'PI_CONVERTED',
                invoiceId: invoice.id,
            },
        });
        this.logger.log(`Proforma ${proforma.proformaNo} converted to invoice ${invoiceNo}`);
        return invoice;
    }
    async cancel(tenantId, id, reason, userId) {
        const proforma = await this.prisma.working.proformaInvoice.findFirst({
            where: { id, tenantId },
        });
        if (!proforma)
            throw app_error_1.AppError.from('PROFORMA_NOT_FOUND');
        if (proforma.status === 'PI_CONVERTED') {
            throw app_error_1.AppError.from('PROFORMA_ALREADY_CONVERTED');
        }
        return this.prisma.working.proformaInvoice.update({
            where: { id },
            data: {
                status: 'PI_CANCELLED',
                cancelledAt: new Date(),
                cancelledById: userId,
                cancelReason: reason,
            },
        });
    }
};
exports.ProformaInvoiceService = ProformaInvoiceService;
exports.ProformaInvoiceService = ProformaInvoiceService = ProformaInvoiceService_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('identity', 'Uses AutoNumberService (pro-forma numbering) and CompanyProfileService (seller details on PDF) from identity settings'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gst_calculator_service_1.GstCalculatorService,
        amount_in_words_service_1.AmountInWordsService,
        auto_number_service_1.AutoNumberService,
        company_profile_service_1.CompanyProfileService,
        invoice_service_1.InvoiceService])
], ProformaInvoiceService);
//# sourceMappingURL=proforma-invoice.service.js.map