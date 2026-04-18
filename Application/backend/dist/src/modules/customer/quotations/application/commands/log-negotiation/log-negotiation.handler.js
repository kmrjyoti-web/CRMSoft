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
var LogNegotiationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogNegotiationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const log_negotiation_command_1 = require("./log-negotiation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let LogNegotiationHandler = LogNegotiationHandler_1 = class LogNegotiationHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LogNegotiationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({ where: { id: cmd.quotationId } });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            if (['SENT', 'VIEWED'].includes(quotation.status)) {
                await this.prisma.working.quotation.update({
                    where: { id: cmd.quotationId },
                    data: { status: 'NEGOTIATION' },
                });
            }
            const log = await this.prisma.working.quotationNegotiationLog.create({
                data: {
                    quotationId: cmd.quotationId,
                    negotiationType: cmd.negotiationType,
                    customerRequirement: cmd.customerRequirement,
                    customerBudget: cmd.customerBudget,
                    customerPriceExpected: cmd.customerPriceExpected,
                    ourPrice: cmd.ourPrice,
                    proposedDiscount: cmd.proposedDiscount,
                    counterOfferAmount: cmd.counterOfferAmount,
                    itemsAdded: cmd.itemsAdded,
                    itemsRemoved: cmd.itemsRemoved,
                    itemsModified: cmd.itemsModified,
                    termsChanged: cmd.termsChanged,
                    note: cmd.note,
                    outcome: cmd.outcome,
                    loggedById: cmd.userId,
                    loggedByName: cmd.userName,
                    contactPersonId: cmd.contactPersonId,
                    contactPersonName: cmd.contactPersonName,
                    loggedAt: new Date(),
                },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.quotationId, action: 'NEGOTIATION',
                    description: `Negotiation: ${cmd.negotiationType}${cmd.note ? ' — ' + cmd.note : ''}`,
                    changedField: 'negotiation',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return log;
        }
        catch (error) {
            this.logger.error(`LogNegotiationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.LogNegotiationHandler = LogNegotiationHandler;
exports.LogNegotiationHandler = LogNegotiationHandler = LogNegotiationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(log_negotiation_command_1.LogNegotiationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogNegotiationHandler);
//# sourceMappingURL=log-negotiation.handler.js.map