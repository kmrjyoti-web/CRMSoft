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
var CreateFromTemplateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFromTemplateHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_from_template_command_1 = require("./create-from-template.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_number_service_1 = require("../../../services/quotation-number.service");
const quotation_calculator_service_1 = require("../../../services/quotation-calculator.service");
let CreateFromTemplateHandler = CreateFromTemplateHandler_1 = class CreateFromTemplateHandler {
    constructor(prisma, numberService, calculator) {
        this.prisma = prisma;
        this.numberService = numberService;
        this.calculator = calculator;
        this.logger = new common_1.Logger(CreateFromTemplateHandler_1.name);
    }
    async execute(cmd) {
        try {
            const template = await this.prisma.working.quotationTemplate.findUnique({
                where: { id: cmd.templateId },
            });
            if (!template)
                throw new common_1.NotFoundException('Template not found');
            const lead = await this.prisma.working.lead.findUnique({
                where: { id: cmd.leadId },
                include: { organization: { select: { state: true } } },
            });
            if (!lead)
                throw new common_1.NotFoundException('Lead not found');
            const quotationNo = await this.numberService.generateNumber();
            const customerState = lead.organization?.state || undefined;
            const interState = this.calculator.isInterState(customerState);
            const lineItemData = [];
            const defaultItems = template.defaultItems || [];
            for (const item of defaultItems) {
                let productName = item.productName || 'Item';
                let productCode = null;
                let hsnCode = null;
                let gstRate = item.gstRate;
                let unitPrice = item.unitPrice || 0;
                if (item.productId) {
                    const product = await this.prisma.working.product.findUnique({
                        where: { id: item.productId },
                        select: { name: true, code: true, hsnCode: true, gstRate: true, salePrice: true },
                    });
                    if (product) {
                        productName = product.name;
                        productCode = product.code;
                        hsnCode = product.hsnCode;
                        if (gstRate === undefined && product.gstRate)
                            gstRate = Number(product.gstRate);
                        if (!unitPrice && product.salePrice)
                            unitPrice = Number(product.salePrice);
                    }
                }
                const calc = this.calculator.calculateLineItem({
                    quantity: item.quantity || 1, unitPrice,
                    discountType: item.discountType, discountValue: item.discountValue, gstRate,
                }, interState);
                lineItemData.push({
                    productId: item.productId, productCode, productName,
                    hsnCode, quantity: item.quantity || 1, unitPrice,
                    discountType: item.discountType, discountValue: item.discountValue,
                    discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
                    gstRate: gstRate || null,
                    cgstAmount: calc.cgstAmount, sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
                    taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
                    sortOrder: lineItemData.length,
                });
            }
            const quotation = await this.prisma.working.quotation.create({
                data: {
                    quotationNo, status: 'DRAFT',
                    coverNote: template.coverNote,
                    paymentTerms: template.defaultPayment,
                    deliveryTerms: template.defaultDelivery,
                    warrantyTerms: template.defaultWarranty,
                    termsConditions: template.defaultTerms,
                    leadId: cmd.leadId, createdById: cmd.userId,
                    lineItems: { create: lineItemData },
                },
                include: { lineItems: true, lead: true },
            });
            await this.calculator.recalculate(quotation.id, customerState);
            await this.prisma.working.quotationTemplate.update({
                where: { id: cmd.templateId },
                data: { usageCount: { increment: 1 } },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: quotation.id, action: 'CREATED',
                    description: `Created from template "${template.name}"`,
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
            this.logger.error(`CreateFromTemplateHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateFromTemplateHandler = CreateFromTemplateHandler;
exports.CreateFromTemplateHandler = CreateFromTemplateHandler = CreateFromTemplateHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_from_template_command_1.CreateFromTemplateCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_number_service_1.QuotationNumberService,
        quotation_calculator_service_1.QuotationCalculatorService])
], CreateFromTemplateHandler);
//# sourceMappingURL=create-from-template.handler.js.map