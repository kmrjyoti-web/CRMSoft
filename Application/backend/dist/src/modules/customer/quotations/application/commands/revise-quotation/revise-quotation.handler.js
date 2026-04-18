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
var ReviseQuotationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviseQuotationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const revise_quotation_command_1 = require("./revise-quotation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_number_service_1 = require("../../../services/quotation-number.service");
let ReviseQuotationHandler = ReviseQuotationHandler_1 = class ReviseQuotationHandler {
    constructor(prisma, numberService) {
        this.prisma = prisma;
        this.numberService = numberService;
        this.logger = new common_1.Logger(ReviseQuotationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const old = await this.prisma.working.quotation.findUnique({
                where: { id: cmd.id },
                include: { lineItems: true },
            });
            if (!old)
                throw new common_1.NotFoundException('Quotation not found');
            const allowed = ['SENT', 'VIEWED', 'NEGOTIATION'];
            if (!allowed.includes(old.status)) {
                throw new common_1.BadRequestException(`Cannot revise quotation with status ${old.status}`);
            }
            const newVersion = old.version + 1;
            const newNo = this.numberService.generateRevisionNumber(old.quotationNo, newVersion);
            const revised = await this.prisma.working.quotation.create({
                data: {
                    quotationNo: newNo, status: 'DRAFT', version: newVersion,
                    title: old.title, summary: old.summary, coverNote: old.coverNote,
                    subtotal: old.subtotal, discountType: old.discountType,
                    discountValue: old.discountValue, discountAmount: old.discountAmount,
                    taxableAmount: old.taxableAmount, cgstAmount: old.cgstAmount,
                    sgstAmount: old.sgstAmount, igstAmount: old.igstAmount,
                    cessAmount: old.cessAmount, totalTax: old.totalTax,
                    roundOff: old.roundOff, totalAmount: old.totalAmount,
                    priceType: old.priceType, minAmount: old.minAmount,
                    maxAmount: old.maxAmount, plusMinusPercent: old.plusMinusPercent,
                    validFrom: old.validFrom, validUntil: old.validUntil,
                    paymentTerms: old.paymentTerms, deliveryTerms: old.deliveryTerms,
                    warrantyTerms: old.warrantyTerms, termsConditions: old.termsConditions,
                    leadId: old.leadId, contactPersonId: old.contactPersonId,
                    organizationId: old.organizationId,
                    parentQuotationId: old.id,
                    tags: old.tags, internalNotes: old.internalNotes,
                    createdById: cmd.userId,
                    lineItems: {
                        create: old.lineItems.map((li) => ({
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
            await this.prisma.working.quotation.update({
                where: { id: old.id },
                data: { status: 'REVISED' },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: old.id, action: 'REVISED',
                    description: `Revised — new version ${newNo} created`,
                    previousValue: old.status, newValue: 'REVISED', changedField: 'status',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: revised.id, action: 'CREATED',
                    description: `Created as revision of ${old.quotationNo}`,
                    newValue: 'DRAFT', changedField: 'status',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return revised;
        }
        catch (error) {
            this.logger.error(`ReviseQuotationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ReviseQuotationHandler = ReviseQuotationHandler;
exports.ReviseQuotationHandler = ReviseQuotationHandler = ReviseQuotationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(revise_quotation_command_1.ReviseQuotationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_number_service_1.QuotationNumberService])
], ReviseQuotationHandler);
//# sourceMappingURL=revise-quotation.handler.js.map