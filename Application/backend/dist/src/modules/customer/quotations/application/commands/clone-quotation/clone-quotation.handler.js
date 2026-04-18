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
var CloneQuotationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneQuotationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const clone_quotation_command_1 = require("./clone-quotation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_number_service_1 = require("../../../services/quotation-number.service");
let CloneQuotationHandler = CloneQuotationHandler_1 = class CloneQuotationHandler {
    constructor(prisma, numberService) {
        this.prisma = prisma;
        this.numberService = numberService;
        this.logger = new common_1.Logger(CloneQuotationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const source = await this.prisma.working.quotation.findUnique({
                where: { id: cmd.id },
                include: { lineItems: true },
            });
            if (!source)
                throw new common_1.NotFoundException('Quotation not found');
            const quotationNo = await this.numberService.generateNumber();
            const targetLeadId = cmd.leadId || source.leadId;
            const cloned = await this.prisma.working.quotation.create({
                data: {
                    quotationNo, status: 'DRAFT', version: 1,
                    title: source.title ? `Copy of ${source.title}` : null,
                    summary: source.summary, coverNote: source.coverNote,
                    priceType: source.priceType,
                    minAmount: source.minAmount, maxAmount: source.maxAmount,
                    plusMinusPercent: source.plusMinusPercent,
                    validUntil: source.validUntil,
                    paymentTerms: source.paymentTerms, deliveryTerms: source.deliveryTerms,
                    warrantyTerms: source.warrantyTerms, termsConditions: source.termsConditions,
                    discountType: source.discountType, discountValue: source.discountValue,
                    leadId: targetLeadId,
                    contactPersonId: source.contactPersonId, organizationId: source.organizationId,
                    tags: source.tags, createdById: cmd.userId,
                    lineItems: {
                        create: source.lineItems.map((li) => ({
                            productId: li.productId, productCode: li.productCode,
                            productName: li.productName, description: li.description,
                            hsnCode: li.hsnCode, quantity: li.quantity, unit: li.unit,
                            unitPrice: li.unitPrice, mrp: li.mrp,
                            discountType: li.discountType, discountValue: li.discountValue,
                            discountAmount: li.discountAmount, lineTotal: li.lineTotal,
                            gstRate: li.gstRate, cgstAmount: li.cgstAmount,
                            sgstAmount: li.sgstAmount, igstAmount: li.igstAmount,
                            cessRate: li.cessRate, cessAmount: li.cessAmount,
                            taxAmount: li.taxAmount, totalWithTax: li.totalWithTax,
                            sortOrder: li.sortOrder, notes: li.notes, isOptional: li.isOptional,
                        })),
                    },
                },
                include: { lineItems: true, lead: true },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cloned.id, action: 'CREATED',
                    description: `Cloned from ${source.quotationNo}`,
                    newValue: 'DRAFT', changedField: 'status',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return cloned;
        }
        catch (error) {
            this.logger.error(`CloneQuotationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CloneQuotationHandler = CloneQuotationHandler;
exports.CloneQuotationHandler = CloneQuotationHandler = CloneQuotationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(clone_quotation_command_1.CloneQuotationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_number_service_1.QuotationNumberService])
], CloneQuotationHandler);
//# sourceMappingURL=clone-quotation.handler.js.map