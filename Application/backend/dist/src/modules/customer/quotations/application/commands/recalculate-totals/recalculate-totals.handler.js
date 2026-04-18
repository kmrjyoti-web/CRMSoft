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
var RecalculateTotalsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecalculateTotalsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const recalculate_totals_command_1 = require("./recalculate-totals.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const quotation_calculator_service_1 = require("../../../services/quotation-calculator.service");
let RecalculateTotalsHandler = RecalculateTotalsHandler_1 = class RecalculateTotalsHandler {
    constructor(prisma, calculator) {
        this.prisma = prisma;
        this.calculator = calculator;
        this.logger = new common_1.Logger(RecalculateTotalsHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({
                where: { id: cmd.quotationId },
                include: { lead: { include: { organization: { select: { state: true } } } } },
            });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            const customerState = quotation.lead?.organization?.state || undefined;
            const totals = await this.calculator.recalculate(cmd.quotationId, customerState);
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.quotationId, action: 'RECALCULATED',
                    description: `Totals recalculated: ₹${totals.totalAmount}`,
                    newValue: String(totals.totalAmount), changedField: 'totalAmount',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return totals;
        }
        catch (error) {
            this.logger.error(`RecalculateTotalsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RecalculateTotalsHandler = RecalculateTotalsHandler;
exports.RecalculateTotalsHandler = RecalculateTotalsHandler = RecalculateTotalsHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(recalculate_totals_command_1.RecalculateTotalsCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        quotation_calculator_service_1.QuotationCalculatorService])
], RecalculateTotalsHandler);
//# sourceMappingURL=recalculate-totals.handler.js.map