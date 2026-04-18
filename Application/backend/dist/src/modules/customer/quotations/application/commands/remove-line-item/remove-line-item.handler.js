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
var RemoveLineItemHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveLineItemHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const remove_line_item_command_1 = require("./remove-line-item.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_calculator_service_1 = require("../../../services/quotation-calculator.service");
let RemoveLineItemHandler = RemoveLineItemHandler_1 = class RemoveLineItemHandler {
    constructor(prisma, calculator) {
        this.prisma = prisma;
        this.calculator = calculator;
        this.logger = new common_1.Logger(RemoveLineItemHandler_1.name);
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
                throw new common_1.BadRequestException('Cannot remove items from non-draft quotation');
            }
            const item = await this.prisma.working.quotationLineItem.findUnique({ where: { id: cmd.itemId } });
            if (!item || item.quotationId !== cmd.quotationId) {
                throw new common_1.NotFoundException('Line item not found');
            }
            await this.prisma.working.quotationLineItem.delete({ where: { id: cmd.itemId } });
            const customerState = quotation.lead?.organization?.state || undefined;
            await this.calculator.recalculate(cmd.quotationId, customerState);
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.quotationId, action: 'ITEM_REMOVED',
                    description: `Item "${item.productName}" removed`,
                    previousValue: item.productName, changedField: 'lineItems',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return { removed: true };
        }
        catch (error) {
            this.logger.error(`RemoveLineItemHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RemoveLineItemHandler = RemoveLineItemHandler;
exports.RemoveLineItemHandler = RemoveLineItemHandler = RemoveLineItemHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(remove_line_item_command_1.RemoveLineItemCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_calculator_service_1.QuotationCalculatorService])
], RemoveLineItemHandler);
//# sourceMappingURL=remove-line-item.handler.js.map