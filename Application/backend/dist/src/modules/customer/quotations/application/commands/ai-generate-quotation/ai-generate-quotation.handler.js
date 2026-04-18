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
var AiGenerateQuotationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiGenerateQuotationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const ai_generate_quotation_command_1 = require("./ai-generate-quotation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_number_service_1 = require("../../../services/quotation-number.service");
const quotation_calculator_service_1 = require("../../../services/quotation-calculator.service");
const quotation_prediction_service_1 = require("../../../services/quotation-prediction.service");
let AiGenerateQuotationHandler = AiGenerateQuotationHandler_1 = class AiGenerateQuotationHandler {
    constructor(prisma, numberService, calculator, prediction) {
        this.prisma = prisma;
        this.numberService = numberService;
        this.calculator = calculator;
        this.prediction = prediction;
        this.logger = new common_1.Logger(AiGenerateQuotationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const lead = await this.prisma.working.lead.findUnique({
                where: { id: cmd.leadId },
                include: { organization: { select: { id: true, state: true, name: true } }, contact: true },
            });
            if (!lead)
                throw new common_1.NotFoundException('Lead not found');
            const predictionResult = await this.prediction.predict(cmd.leadId);
            const recs = predictionResult.recommendations;
            const quotationNo = await this.numberService.generateNumber();
            const customerState = lead.organization?.state || undefined;
            const interState = this.calculator.isInterState(customerState);
            const lineItemData = [];
            for (const sp of recs.suggestedProducts) {
                const product = await this.prisma.working.product.findUnique({
                    where: { id: sp.productId },
                    select: { name: true, code: true, hsnCode: true, gstRate: true, salePrice: true, mrp: true },
                });
                if (!product)
                    continue;
                const unitPrice = recs.suggestedPriceRange?.optimal
                    ? Number(recs.suggestedPriceRange.optimal) / recs.suggestedProducts.length
                    : Number(product.salePrice || product.mrp || 0);
                const discountValue = recs.suggestedDiscount?.sweet_spot || 0;
                const calc = this.calculator.calculateLineItem({
                    quantity: 1, unitPrice,
                    discountType: discountValue > 0 ? 'PERCENTAGE' : undefined,
                    discountValue: discountValue > 0 ? discountValue : undefined,
                    gstRate: product.gstRate ? Number(product.gstRate) : undefined,
                }, interState);
                lineItemData.push({
                    productId: sp.productId, productCode: product.code,
                    productName: product.name, hsnCode: product.hsnCode,
                    quantity: 1, unitPrice, mrp: product.mrp,
                    discountType: discountValue > 0 ? 'PERCENTAGE' : null,
                    discountValue: discountValue > 0 ? discountValue : null,
                    discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
                    gstRate: product.gstRate,
                    cgstAmount: calc.cgstAmount, sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
                    taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
                    sortOrder: lineItemData.length,
                });
            }
            const contactName = lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName}` : 'Valued Customer';
            const productNames = lineItemData.map((i) => i.productName).join(', ');
            const coverNote = `Dear ${contactName},\n\nThank you for your interest. Based on your requirements, we are pleased to offer ${productNames || 'our products'}.\n\nWe look forward to working with you.`;
            const quotation = await this.prisma.working.quotation.create({
                data: {
                    quotationNo, status: 'DRAFT',
                    title: `AI Generated � ${lead.organization?.name || contactName}`,
                    coverNote,
                    priceType: recs.suggestedPriceType || 'FIXED',
                    validUntil: new Date(Date.now() + (recs.suggestedValidityDays || 30) * 86400000),
                    paymentTerms: recs.suggestedPaymentTerms,
                    leadId: cmd.leadId, organizationId: lead.organization?.id,
                    contactPersonId: lead.contactId,
                    aiScore: predictionResult.score,
                    aiSuggestions: predictionResult,
                    createdById: cmd.userId,
                    lineItems: { create: lineItemData },
                },
                include: { lineItems: true, lead: true },
            });
            await this.calculator.recalculate(quotation.id, customerState);
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: quotation.id, action: 'CREATED',
                    description: `AI-generated quotation (score: ${predictionResult.score}%)`,
                    newValue: 'DRAFT', changedField: 'status',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return this.prisma.working.quotation.findUnique({
                where: { id: quotation.id },
                include: { lineItems: true, lead: true },
            });
        }
        catch (error) {
            this.logger.error(`AiGenerateQuotationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AiGenerateQuotationHandler = AiGenerateQuotationHandler;
exports.AiGenerateQuotationHandler = AiGenerateQuotationHandler = AiGenerateQuotationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(ai_generate_quotation_command_1.AiGenerateQuotationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_number_service_1.QuotationNumberService,
        quotation_calculator_service_1.QuotationCalculatorService,
        quotation_prediction_service_1.QuotationPredictionService])
], AiGenerateQuotationHandler);
//# sourceMappingURL=ai-generate-quotation.handler.js.map