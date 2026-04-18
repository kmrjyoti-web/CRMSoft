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
var AcceptQuotationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptQuotationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const accept_quotation_command_1 = require("./accept-quotation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let AcceptQuotationHandler = AcceptQuotationHandler_1 = class AcceptQuotationHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AcceptQuotationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({ where: { id: cmd.id } });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            const allowed = ['SENT', 'VIEWED', 'NEGOTIATION'];
            if (!allowed.includes(quotation.status)) {
                throw new common_1.BadRequestException(`Cannot accept quotation with status ${quotation.status}`);
            }
            const updated = await this.prisma.working.quotation.update({
                where: { id: cmd.id },
                data: {
                    status: 'ACCEPTED',
                    acceptedAt: new Date(),
                    acceptedNote: cmd.note,
                },
                include: { lineItems: true, lead: true },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.id, action: 'ACCEPTED',
                    description: `Quotation accepted${cmd.note ? ': ' + cmd.note : ''}`,
                    previousValue: quotation.status, newValue: 'ACCEPTED', changedField: 'status',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return updated;
        }
        catch (error) {
            this.logger.error(`AcceptQuotationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AcceptQuotationHandler = AcceptQuotationHandler;
exports.AcceptQuotationHandler = AcceptQuotationHandler = AcceptQuotationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(accept_quotation_command_1.AcceptQuotationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AcceptQuotationHandler);
//# sourceMappingURL=accept-quotation.handler.js.map