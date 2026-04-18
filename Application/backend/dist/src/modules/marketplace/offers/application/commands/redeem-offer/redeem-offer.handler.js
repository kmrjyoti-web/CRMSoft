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
var RedeemOfferHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedeemOfferHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const redeem_offer_command_1 = require("./redeem-offer.command");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
const offer_entity_1 = require("../../../domain/entities/offer.entity");
let RedeemOfferHandler = RedeemOfferHandler_1 = class RedeemOfferHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(RedeemOfferHandler_1.name);
    }
    async execute(command) {
        try {
            const raw = await this.mktPrisma.client.mktOffer.findFirst({
                where: { id: command.offerId, tenantId: command.tenantId, isDeleted: false },
            });
            if (!raw)
                throw new common_1.NotFoundException(`Offer ${command.offerId} not found`);
            const offer = offer_entity_1.OfferEntity.fromPrisma(raw);
            const userRedemptionCount = await this.mktPrisma.client.mktOfferRedemption.count({
                where: { offerId: command.offerId, userId: command.userId },
            });
            const eligibility = offer.isEligible({
                userId: command.userId,
                city: command.city,
                state: command.state,
                pincode: command.pincode,
                grade: command.grade,
                groupId: command.groupId,
                isVerified: command.isVerified,
                orderValue: command.orderValue,
                quantity: command.quantity,
                productId: command.productId,
                categoryId: command.categoryId,
                userRedemptionCount,
            });
            if (!eligibility.eligible) {
                throw new common_1.BadRequestException(eligibility.reason ?? 'Not eligible for this offer');
            }
            const discountAmount = offer.calculateDiscount(command.orderValue ?? 0, command.quantity);
            const redemptionId = (0, crypto_1.randomUUID)();
            await this.mktPrisma.client.$transaction(async (tx) => {
                await tx.mktOfferRedemption.create({
                    data: {
                        id: redemptionId,
                        offerId: command.offerId,
                        userId: command.userId,
                        tenantId: command.tenantId,
                        orderId: command.orderId,
                        discountApplied: discountAmount,
                        orderValue: command.orderValue,
                        city: command.city,
                        state: command.state,
                        deviceType: command.deviceType,
                    },
                });
                const newCount = raw.currentRedemptions + 1;
                const shouldClose = raw.autoCloseOnLimit &&
                    raw.maxRedemptions !== null &&
                    raw.maxRedemptions !== undefined &&
                    newCount >= raw.maxRedemptions;
                await tx.mktOffer.update({
                    where: { id: command.offerId },
                    data: {
                        currentRedemptions: { increment: 1 },
                        orderCount: { increment: 1 },
                        totalOrderValue: { increment: command.orderValue ?? 0 },
                        ...(shouldClose ? { status: 'CLOSED', closedAt: new Date(), closedReason: 'Redemption limit reached' } : {}),
                    },
                });
            });
            this.logger.log(`Offer ${command.offerId} redeemed by user ${command.userId}, discount: ${discountAmount}`);
            return { redemptionId, discountAmount };
        }
        catch (error) {
            this.logger.error(`RedeemOfferHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RedeemOfferHandler = RedeemOfferHandler;
exports.RedeemOfferHandler = RedeemOfferHandler = RedeemOfferHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(redeem_offer_command_1.RedeemOfferCommand),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], RedeemOfferHandler);
//# sourceMappingURL=redeem-offer.handler.js.map