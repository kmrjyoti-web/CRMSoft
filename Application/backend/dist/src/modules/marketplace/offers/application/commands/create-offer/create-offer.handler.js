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
var CreateOfferHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOfferHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const create_offer_command_1 = require("./create-offer.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let CreateOfferHandler = CreateOfferHandler_1 = class CreateOfferHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(CreateOfferHandler_1.name);
    }
    async execute(command) {
        try {
            const id = (0, crypto_1.randomUUID)();
            const offer = await this.mktPrisma.client.mktOffer.create({
                data: {
                    id,
                    tenantId: command.tenantId,
                    authorId: command.authorId,
                    createdById: command.createdById,
                    title: command.title,
                    description: command.description,
                    mediaUrls: command.mediaUrls ?? [],
                    offerType: command.offerType,
                    discountType: command.discountType,
                    discountValue: command.discountValue,
                    linkedListingIds: command.linkedListingIds ?? [],
                    linkedCategoryIds: command.linkedCategoryIds ?? [],
                    primaryListingId: command.primaryListingId,
                    conditions: command.conditions ?? {},
                    maxRedemptions: command.maxRedemptions,
                    autoCloseOnLimit: command.autoCloseOnLimit !== false,
                    resetTime: command.resetTime,
                    publishAt: command.publishAt,
                    expiresAt: command.expiresAt,
                    status: command.publishAt && command.publishAt > new Date() ? 'SCHEDULED' : 'DRAFT',
                },
            });
            this.logger.log(`Offer created: ${offer.id} (${offer.title}) by tenant ${command.tenantId}`);
            return offer.id;
        }
        catch (error) {
            this.logger.error(`CreateOfferHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateOfferHandler = CreateOfferHandler;
exports.CreateOfferHandler = CreateOfferHandler = CreateOfferHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_offer_command_1.CreateOfferCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], CreateOfferHandler);
//# sourceMappingURL=create-offer.handler.js.map