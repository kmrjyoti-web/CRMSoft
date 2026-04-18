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
var RejectQuoteHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectQuoteHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reject_quote_command_1 = require("./reject-quote.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let RejectQuoteHandler = RejectQuoteHandler_1 = class RejectQuoteHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(RejectQuoteHandler_1.name);
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
            if (requirement.authorId !== command.buyerId) {
                throw new common_1.ForbiddenException('Only the requirement owner can reject quotes');
            }
            const quote = await this.mktPrisma.client.mktRequirementQuote.findFirst({
                where: { id: command.quoteId, requirementId: command.requirementId },
            });
            if (!quote) {
                throw new common_1.NotFoundException(`Quote ${command.quoteId} not found`);
            }
            await this.mktPrisma.client.mktRequirementQuote.update({
                where: { id: command.quoteId },
                data: { status: 'REJECTED' },
            });
            this.logger.log(`Quote ${command.quoteId} rejected for requirement ${command.requirementId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`RejectQuoteHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RejectQuoteHandler = RejectQuoteHandler;
exports.RejectQuoteHandler = RejectQuoteHandler = RejectQuoteHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(reject_quote_command_1.RejectQuoteCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], RejectQuoteHandler);
//# sourceMappingURL=reject-quote.handler.js.map