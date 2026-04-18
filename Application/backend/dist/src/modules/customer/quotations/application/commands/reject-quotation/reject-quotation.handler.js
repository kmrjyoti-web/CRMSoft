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
var RejectQuotationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectQuotationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reject_quotation_command_1 = require("./reject-quotation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let RejectQuotationHandler = RejectQuotationHandler_1 = class RejectQuotationHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RejectQuotationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({ where: { id: cmd.id } });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            const allowed = ['SENT', 'VIEWED', 'NEGOTIATION'];
            if (!allowed.includes(quotation.status)) {
                throw new common_1.BadRequestException(`Cannot reject quotation with status ${quotation.status}`);
            }
            const updated = await this.prisma.working.quotation.update({
                where: { id: cmd.id },
                data: {
                    status: 'REJECTED',
                    rejectedAt: new Date(),
                    rejectedReason: cmd.reason,
                },
                include: { lineItems: true, lead: true },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.id, action: 'REJECTED',
                    description: `Quotation rejected${cmd.reason ? ': ' + cmd.reason : ''}`,
                    previousValue: quotation.status, newValue: 'REJECTED', changedField: 'status',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return updated;
        }
        catch (error) {
            this.logger.error(`RejectQuotationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RejectQuotationHandler = RejectQuotationHandler;
exports.RejectQuotationHandler = RejectQuotationHandler = RejectQuotationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reject_quotation_command_1.RejectQuotationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RejectQuotationHandler);
//# sourceMappingURL=reject-quotation.handler.js.map