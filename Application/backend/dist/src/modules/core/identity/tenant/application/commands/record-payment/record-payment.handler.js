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
var RecordPaymentHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordPaymentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const record_payment_command_1 = require("./record-payment.command");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
let RecordPaymentHandler = RecordPaymentHandler_1 = class RecordPaymentHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RecordPaymentHandler_1.name);
    }
    async execute(command) {
        try {
            const invoice = await this.prisma.identity.tenantInvoice.update({
                where: { id: command.invoiceId },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                    gatewayPaymentId: command.gatewayPaymentId,
                },
            });
            this.logger.log(`Payment recorded for invoice ${command.invoiceId}, tenant ${command.tenantId}, amount ${command.amount}`);
            return invoice;
        }
        catch (error) {
            this.logger.error(`RecordPaymentHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RecordPaymentHandler = RecordPaymentHandler;
exports.RecordPaymentHandler = RecordPaymentHandler = RecordPaymentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(record_payment_command_1.RecordPaymentCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordPaymentHandler);
//# sourceMappingURL=record-payment.handler.js.map