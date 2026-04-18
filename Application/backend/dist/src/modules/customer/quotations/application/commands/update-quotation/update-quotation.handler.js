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
var UpdateQuotationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuotationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_quotation_command_1 = require("./update-quotation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_calculator_service_1 = require("../../../services/quotation-calculator.service");
let UpdateQuotationHandler = UpdateQuotationHandler_1 = class UpdateQuotationHandler {
    constructor(prisma, calculator) {
        this.prisma = prisma;
        this.calculator = calculator;
        this.logger = new common_1.Logger(UpdateQuotationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({
                where: { id: cmd.id },
                include: { lead: { include: { organization: { select: { state: true } } } } },
            });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
                throw new common_1.BadRequestException('Only DRAFT or INTERNAL_REVIEW quotations can be edited');
            }
            const data = {};
            if (cmd.title !== undefined)
                data.title = cmd.title;
            if (cmd.summary !== undefined)
                data.summary = cmd.summary;
            if (cmd.coverNote !== undefined)
                data.coverNote = cmd.coverNote;
            if (cmd.priceType !== undefined)
                data.priceType = cmd.priceType;
            if (cmd.minAmount !== undefined)
                data.minAmount = cmd.minAmount;
            if (cmd.maxAmount !== undefined)
                data.maxAmount = cmd.maxAmount;
            if (cmd.plusMinusPercent !== undefined)
                data.plusMinusPercent = cmd.plusMinusPercent;
            if (cmd.validFrom !== undefined)
                data.validFrom = cmd.validFrom;
            if (cmd.validUntil !== undefined)
                data.validUntil = cmd.validUntil;
            if (cmd.paymentTerms !== undefined)
                data.paymentTerms = cmd.paymentTerms;
            if (cmd.deliveryTerms !== undefined)
                data.deliveryTerms = cmd.deliveryTerms;
            if (cmd.warrantyTerms !== undefined)
                data.warrantyTerms = cmd.warrantyTerms;
            if (cmd.termsConditions !== undefined)
                data.termsConditions = cmd.termsConditions;
            if (cmd.discountType !== undefined)
                data.discountType = cmd.discountType;
            if (cmd.discountValue !== undefined)
                data.discountValue = cmd.discountValue;
            if (cmd.tags !== undefined)
                data.tags = cmd.tags;
            if (cmd.internalNotes !== undefined)
                data.internalNotes = cmd.internalNotes;
            await this.prisma.working.quotation.update({ where: { id: cmd.id }, data });
            if (cmd.discountType !== undefined || cmd.discountValue !== undefined) {
                const customerState = quotation.lead?.organization?.state || undefined;
                await this.calculator.recalculate(cmd.id, customerState);
            }
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.id, action: 'UPDATED',
                    description: `Quotation ${quotation.quotationNo} updated`,
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return this.prisma.working.quotation.findUnique({
                where: { id: cmd.id },
                include: { lineItems: true, lead: true },
            });
        }
        catch (error) {
            this.logger.error(`UpdateQuotationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateQuotationHandler = UpdateQuotationHandler;
exports.UpdateQuotationHandler = UpdateQuotationHandler = UpdateQuotationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_quotation_command_1.UpdateQuotationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_calculator_service_1.QuotationCalculatorService])
], UpdateQuotationHandler);
//# sourceMappingURL=update-quotation.handler.js.map