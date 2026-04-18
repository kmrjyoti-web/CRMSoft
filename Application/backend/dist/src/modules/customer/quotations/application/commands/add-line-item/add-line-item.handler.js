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
var AddLineItemHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLineItemHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const add_line_item_command_1 = require("./add-line-item.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_calculator_service_1 = require("../../../services/quotation-calculator.service");
let AddLineItemHandler = AddLineItemHandler_1 = class AddLineItemHandler {
    constructor(prisma, calculator) {
        this.prisma = prisma;
        this.calculator = calculator;
        this.logger = new common_1.Logger(AddLineItemHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({
                where: { id: cmd.quotationId },
                include: {
                    lineItems: { select: { id: true } },
                    lead: { include: { organization: { select: { state: true } } } },
                },
            });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
                throw new common_1.BadRequestException('Cannot add items to non-draft quotation');
            }
            let productCode = null;
            let hsnCode = null;
            let productName = cmd.productName || 'Custom Item';
            let gstRate = cmd.gstRate;
            let mrp = cmd.mrp;
            if (cmd.productId) {
                const product = await this.prisma.working.product.findUnique({
                    where: { id: cmd.productId },
                    select: { name: true, code: true, hsnCode: true, gstRate: true, mrp: true, salePrice: true },
                });
                if (product) {
                    productName = product.name;
                    productCode = product.code;
                    hsnCode = product.hsnCode;
                    if (gstRate === undefined && product.gstRate)
                        gstRate = Number(product.gstRate);
                    if (mrp === undefined && product.mrp)
                        mrp = Number(product.mrp);
                }
            }
            const customerState = quotation.lead?.organization?.state || undefined;
            const interState = this.calculator.isInterState(customerState);
            const calc = this.calculator.calculateLineItem({
                quantity: cmd.quantity || 1, unitPrice: cmd.unitPrice || 0,
                discountType: cmd.discountType, discountValue: cmd.discountValue,
                gstRate, cessRate: cmd.cessRate,
            }, interState);
            const item = await this.prisma.working.quotationLineItem.create({
                data: {
                    quotationId: cmd.quotationId,
                    productId: cmd.productId, productCode, productName,
                    description: cmd.description, hsnCode,
                    quantity: cmd.quantity || 1, unit: cmd.unit,
                    unitPrice: cmd.unitPrice || 0, mrp: mrp || null,
                    discountType: cmd.discountType, discountValue: cmd.discountValue,
                    discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
                    gstRate: gstRate || null,
                    cgstAmount: calc.cgstAmount, sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
                    cessRate: cmd.cessRate || null, cessAmount: calc.cessAmount,
                    taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
                    isOptional: cmd.isOptional || false, notes: cmd.notes,
                    sortOrder: quotation.lineItems.length,
                },
            });
            await this.calculator.recalculate(cmd.quotationId, customerState);
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.quotationId, action: 'ITEM_ADDED',
                    description: `Item "${productName}" added`,
                    newValue: productName, changedField: 'lineItems',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return item;
        }
        catch (error) {
            this.logger.error(`AddLineItemHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AddLineItemHandler = AddLineItemHandler;
exports.AddLineItemHandler = AddLineItemHandler = AddLineItemHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(add_line_item_command_1.AddLineItemCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_calculator_service_1.QuotationCalculatorService])
], AddLineItemHandler);
//# sourceMappingURL=add-line-item.handler.js.map