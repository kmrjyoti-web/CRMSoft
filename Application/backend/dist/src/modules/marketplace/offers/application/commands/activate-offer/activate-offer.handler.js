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
var ActivateOfferHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivateOfferHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const activate_offer_command_1 = require("./activate-offer.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let ActivateOfferHandler = ActivateOfferHandler_1 = class ActivateOfferHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(ActivateOfferHandler_1.name);
    }
    async execute(command) {
        try {
            const offer = await this.mktPrisma.client.mktOffer.findFirst({
                where: { id: command.offerId, tenantId: command.tenantId, isDeleted: false },
            });
            if (!offer)
                throw new common_1.NotFoundException(`Offer ${command.offerId} not found`);
            if (!['DRAFT', 'SCHEDULED', 'PAUSED'].includes(offer.status)) {
                throw new common_1.BadRequestException(`Cannot activate offer in status: ${offer.status}`);
            }
            await this.mktPrisma.client.mktOffer.update({
                where: { id: command.offerId },
                data: {
                    status: 'ACTIVE',
                    publishedAt: offer.publishedAt ?? new Date(),
                },
            });
            this.logger.log(`Offer activated: ${command.offerId}`);
        }
        catch (error) {
            this.logger.error(`ActivateOfferHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ActivateOfferHandler = ActivateOfferHandler;
exports.ActivateOfferHandler = ActivateOfferHandler = ActivateOfferHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(activate_offer_command_1.ActivateOfferCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], ActivateOfferHandler);
//# sourceMappingURL=activate-offer.handler.js.map