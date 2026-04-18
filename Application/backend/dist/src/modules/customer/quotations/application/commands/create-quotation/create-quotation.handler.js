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
var CreateQuotationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuotationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_quotation_command_1 = require("./create-quotation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_number_service_1 = require("../../../services/quotation-number.service");
const quotation_calculator_service_1 = require("../../../services/quotation-calculator.service");
let CreateQuotationHandler = CreateQuotationHandler_1 = class CreateQuotationHandler {
    constructor(prisma, numberService, calculator) {
        this.prisma = prisma;
        this.numberService = numberService;
        this.calculator = calculator;
        this.logger = new common_1.Logger(CreateQuotationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const lead = await this.prisma.working.lead.findFirst({
                where: { id: cmd.leadId, tenantId: cmd.tenantId },
                include: { organization: { select: { id: true, state: true } } },
            });
            if (!lead)
                throw new common_1.NotFoundException('Lead not found');
            const quotationNo = await this.numberService.generateNumber(cmd.tenantId);
            const customerState = lead.organization?.state || undefined;
            const lineItemData = [];
            for (const item of cmd.items || []) {
                let productCode = null;
                let hsnCode = null;
                let gstRate = item.gstRate;
                let mrp = item.mrp;
                if (item.productId) {
                    const product = await this.prisma.working.product.findFirst({
                        where: { id: item.productId, tenantId: cmd.tenantId },
                        select: { code: true, hsnCode: true, gstRate: true, mrp: true },
                    });
                    if (product) {
                        productCode = product.code;
                        hsnCode = product.hsnCode;
                        if (gstRate === undefined && product.gstRate)
                            gstRate = Number(product.gstRate);
                        if (mrp === undefined && product.mrp)
                            mrp = Number(product.mrp);
                    }
                }
                const calc = this.calculator.calculateLineItem({
                    quantity: item.quantity, unitPrice: item.unitPrice,
                    discountType: item.discountType, discountValue: item.discountValue,
                    gstRate, cessRate: item.cessRate,
                }, this.calculator.isInterState(customerState));
                lineItemData.push({
                    tenantId: cmd.tenantId,
                    productId: item.productId, productCode, productName: item.productName,
                    description: item.description, hsnCode,
                    quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice,
                    mrp: mrp || null,
                    discountType: item.discountType, discountValue: item.discountValue,
                    discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
                    gstRate: gstRate || null, cgstAmount: calc.cgstAmount,
                    sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
                    cessRate: item.cessRate || null, cessAmount: calc.cessAmount,
                    taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
                    isOptional: item.isOptional || false, notes: item.notes,
                    sortOrder: lineItemData.length,
                });
            }
            const quotation = await this.prisma.working.quotation.create({
                data: {
                    tenantId: cmd.tenantId,
                    quotationNo, status: 'DRAFT', title: cmd.title, summary: cmd.summary,
                    coverNote: cmd.coverNote,
                    priceType: cmd.priceType || 'FIXED',
                    minAmount: cmd.minAmount, maxAmount: cmd.maxAmount,
                    plusMinusPercent: cmd.plusMinusPercent,
                    validFrom: cmd.validFrom, validUntil: cmd.validUntil,
                    paymentTerms: cmd.paymentTerms, deliveryTerms: cmd.deliveryTerms,
                    warrantyTerms: cmd.warrantyTerms, termsConditions: cmd.termsConditions,
                    discountType: cmd.discountType, discountValue: cmd.discountValue || 0,
                    leadId: cmd.leadId, contactPersonId: cmd.contactPersonId,
                    organizationId: cmd.organizationId,
                    tags: cmd.tags || [], internalNotes: cmd.internalNotes,
                    createdById: cmd.userId,
                    lineItems: { create: lineItemData },
                },
                include: { lineItems: true, lead: true },
            });
            await this.calculator.recalculate(quotation.id, customerState, cmd.tenantId);
            await this.prisma.working.quotationActivity.create({
                data: {
                    tenantId: cmd.tenantId,
                    quotationId: quotation.id, action: 'CREATED',
                    description: `Quotation ${quotationNo} created`,
                    newValue: 'DRAFT', changedField: 'status',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return this.prisma.working.quotation.findFirst({
                where: { id: quotation.id, tenantId: cmd.tenantId },
                include: { lineItems: true, lead: true },
            });
        }
        catch (error) {
            this.logger.error(`CreateQuotationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateQuotationHandler = CreateQuotationHandler;
exports.CreateQuotationHandler = CreateQuotationHandler = CreateQuotationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_quotation_command_1.CreateQuotationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_number_service_1.QuotationNumberService,
        quotation_calculator_service_1.QuotationCalculatorService])
], CreateQuotationHandler);
//# sourceMappingURL=create-quotation.handler.js.map