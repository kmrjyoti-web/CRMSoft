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
var SendQuotationHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendQuotationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const send_quotation_command_1 = require("./send-quotation.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let SendQuotationHandler = SendQuotationHandler_1 = class SendQuotationHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SendQuotationHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({
                where: { id: cmd.id },
                include: { lead: { include: { organization: true, contact: true } } },
            });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            if (!['DRAFT', 'INTERNAL_REVIEW'].includes(quotation.status)) {
                throw new common_1.BadRequestException(`Cannot send quotation with status ${quotation.status}`);
            }
            await this.prisma.working.quotation.update({
                where: { id: cmd.id },
                data: { status: 'SENT' },
            });
            let receiverName = cmd.receiverEmail;
            let receiverEmail = cmd.receiverEmail;
            let receiverPhone = cmd.receiverPhone;
            let orgName = null;
            let orgId = null;
            if (cmd.receiverContactId) {
                const contact = await this.prisma.working.contact.findUnique({
                    where: { id: cmd.receiverContactId },
                    select: { firstName: true, lastName: true },
                });
                if (contact)
                    receiverName = `${contact.firstName} ${contact.lastName}`;
            }
            if (quotation.lead?.organization) {
                orgName = quotation.lead.organization.name;
                orgId = quotation.lead.organization.id;
            }
            const sendLog = await this.prisma.working.quotationSendLog.create({
                data: {
                    quotationId: cmd.id,
                    sentAt: new Date(),
                    sentById: cmd.userId,
                    sentByName: cmd.userName,
                    channel: cmd.channel,
                    receiverContactId: cmd.receiverContactId,
                    receiverName, receiverEmail, receiverPhone,
                    organizationId: orgId, organizationName: orgName,
                    quotationValue: quotation.totalAmount,
                    priceType: quotation.priceType,
                    minValue: quotation.minAmount,
                    maxValue: quotation.maxAmount,
                    plusMinusPercent: quotation.plusMinusPercent,
                    message: cmd.message,
                },
            });
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.id, action: 'SENT',
                    description: `Quotation sent via ${cmd.channel} to ${receiverName || 'customer'}`,
                    previousValue: quotation.status, newValue: 'SENT', changedField: 'status',
                    performedById: cmd.userId, performedByName: cmd.userName,
                },
            });
            return sendLog;
        }
        catch (error) {
            this.logger.error(`SendQuotationHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SendQuotationHandler = SendQuotationHandler;
exports.SendQuotationHandler = SendQuotationHandler = SendQuotationHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(send_quotation_command_1.SendQuotationCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SendQuotationHandler);
//# sourceMappingURL=send-quotation.handler.js.map