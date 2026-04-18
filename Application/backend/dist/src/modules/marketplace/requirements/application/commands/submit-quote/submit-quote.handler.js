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
var SubmitQuoteHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitQuoteHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const submit_quote_command_1 = require("./submit-quote.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let SubmitQuoteHandler = SubmitQuoteHandler_1 = class SubmitQuoteHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(SubmitQuoteHandler_1.name);
    }
    async execute(command) {
        try {
            const requirement = await this.mktPrisma.client.mktListing.findFirst({
                where: {
                    id: command.requirementId,
                    tenantId: command.tenantId,
                    listingType: 'REQUIREMENT',
                    isDeleted: false,
                },
            });
            if (!requirement) {
                throw new common_1.NotFoundException(`Requirement ${command.requirementId} not found`);
            }
            const id = (0, crypto_1.randomUUID)();
            const quote = await this.mktPrisma.client.mktRequirementQuote.create({
                data: {
                    id,
                    requirementId: command.requirementId,
                    sellerId: command.sellerId,
                    tenantId: command.tenantId,
                    pricePerUnit: command.pricePerUnit,
                    quantity: command.quantity,
                    deliveryDays: command.deliveryDays,
                    creditDays: command.creditDays,
                    notes: command.notes,
                    certifications: command.certifications ?? [],
                    status: 'SUBMITTED',
                },
            });
            this.logger.log(`Quote ${quote.id} submitted by seller ${command.sellerId} for requirement ${command.requirementId}`);
            return quote.id;
        }
        catch (error) {
            this.logger.error(`SubmitQuoteHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SubmitQuoteHandler = SubmitQuoteHandler;
exports.SubmitQuoteHandler = SubmitQuoteHandler = SubmitQuoteHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(submit_quote_command_1.SubmitQuoteCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], SubmitQuoteHandler);
//# sourceMappingURL=submit-quote.handler.js.map