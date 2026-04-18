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
var UpdateLineItemHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLineItemHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_line_item_command_1 = require("./update-line-item.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_calculator_service_1 = require("../../../services/quotation-calculator.service");
let UpdateLineItemHandler = UpdateLineItemHandler_1 = class UpdateLineItemHandler {
    constructor(prisma, calculator) {
        this.prisma = prisma;
        this.calculator = calculator;
        this.logger = new common_1.Logger(UpdateLineItemHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({
                where: { id: cmd.quotationId },
                include: { lead: { include: { organization: { select: { state: true } } } } },
            });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
                throw new common_1.BadRequestException('Cannot update items on non-draft quotation');
            }
            const item = await this.prisma.working.quotationLineItem.findUnique({ where: { id: cmd.itemId } });
            if (!item || item.quotationId !== cmd.quotationId) {
                throw new common_1.NotFoundException('Line item not found');
            }
            const data = {};
            if (cmd.productName !== undefined)
                data.productName = cmd.productName;
            if (cmd.description !== undefined)
                data.description = cmd.description;
            if (cmd.quantity !== undefined)
                data.quantity = cmd.quantity;
            if (cmd.unit !== undefined)
                data.unit = cmd.unit;
            if (cmd.unitPrice !== undefined)
                data.unitPrice = cmd.unitPrice;
            if (cmd.discountType !== undefined)
                data.discountType = cmd.discountType;
            if (cmd.discountValue !== undefined)
                data.discountValue = cmd.discountValue;
            if (cmd.gstRate !== undefined)
                data.gstRate = cmd.gstRate;
            if (cmd.cessRate !== undefined)
                data.cessRate = cmd.cessRate;
            if (cmd.isOptional !== undefined)
                data.isOptional = cmd.isOptional;
            if (cmd.notes !== undefined)
                data.notes = cmd.notes;
            const customerState = quotation.lead?.organization?.state || undefined;
            const calc = this.calculator.calculateLineItem({
                quantity: cmd.quantity ?? Number(item.quantity),
                unitPrice: cmd.unitPrice ?? Number(item.unitPrice),
                discountType: cmd.discountType ?? item.discountType ?? undefined,
                discountValue: cmd.discountValue ?? (item.discountValue ? Number(item.discountValue) : undefined),
                gstRate: cmd.gstRate ?? (item.gstRate ? Number(item.gstRate) : undefined),
                cessRate: cmd.cessRate ?? (item.cessRate ? Number(item.cessRate) : undefined),
            }, this.calculator.isInterState(customerState));
            Object.assign(data, {
                discountAmount: calc.discountAmount, lineTotal: calc.lineTotal,
                cgstAmount: calc.cgstAmount, sgstAmount: calc.sgstAmount, igstAmount: calc.igstAmount,
                cessAmount: calc.cessAmount, taxAmount: calc.taxAmount, totalWithTax: calc.totalWithTax,
            });
            const updated = await this.prisma.working.quotationLineItem.update({
                where: { id: cmd.itemId }, data,
            });
            await this.calculator.recalculate(cmd.quotationId, customerState);
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.quotationId, action: 'ITEM_UPDATED',
                    description: `Item "${updated.productName}" updated`,
                    changedField: 'lineItems',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return updated;
        }
        catch (error) {
            this.logger.error(`UpdateLineItemHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateLineItemHandler = UpdateLineItemHandler;
exports.UpdateLineItemHandler = UpdateLineItemHandler = UpdateLineItemHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_line_item_command_1.UpdateLineItemCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_calculator_service_1.QuotationCalculatorService])
], UpdateLineItemHandler);
//# sourceMappingURL=update-line-item.handler.js.map