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
var AcceptQuoteHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptQuoteHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const accept_quote_command_1 = require("./accept-quote.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let AcceptQuoteHandler = AcceptQuoteHandler_1 = class AcceptQuoteHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(AcceptQuoteHandler_1.name);
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
                throw new common_1.ForbiddenException('Only the requirement owner can accept quotes');
            }
            await this.mktPrisma.client.$transaction([
                this.mktPrisma.client.mktRequirementQuote.update({
                    where: { id: command.quoteId },
                    data: { status: 'ACCEPTED' },
                }),
                this.mktPrisma.client.mktRequirementQuote.updateMany({
                    where: {
                        requirementId: command.requirementId,
                        id: { not: command.quoteId },
                        status: 'SUBMITTED',
                    },
                    data: { status: 'REJECTED' },
                }),
            ]);
            this.logger.log(`Quote ${command.quoteId} accepted for requirement ${command.requirementId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`AcceptQuoteHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.AcceptQuoteHandler = AcceptQuoteHandler;
exports.AcceptQuoteHandler = AcceptQuoteHandler = AcceptQuoteHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(accept_quote_command_1.AcceptQuoteCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], AcceptQuoteHandler);
//# sourceMappingURL=accept-quote.handler.js.map