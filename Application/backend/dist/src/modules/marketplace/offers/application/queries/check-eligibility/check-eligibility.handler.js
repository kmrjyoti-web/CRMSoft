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
var CheckEligibilityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckEligibilityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const check_eligibility_query_1 = require("./check-eligibility.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
const offer_entity_1 = require("../../../domain/entities/offer.entity");
let CheckEligibilityHandler = CheckEligibilityHandler_1 = class CheckEligibilityHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(CheckEligibilityHandler_1.name);
    }
    async execute(query) {
        try {
            const raw = await this.mktPrisma.client.mktOffer.findFirst({
                where: { id: query.offerId, tenantId: query.tenantId, isDeleted: false },
            });
            if (!raw)
                throw new common_1.NotFoundException(`Offer ${query.offerId} not found`);
            const offer = offer_entity_1.OfferEntity.fromPrisma(raw);
            const userRedemptionCount = await this.mktPrisma.client.mktOfferRedemption.count({
                where: { offerId: query.offerId, userId: query.userId },
            });
            const result = offer.isEligible({
                userId: query.userId,
                city: query.city,
                state: query.state,
                pincode: query.pincode,
                grade: query.grade,
                groupId: query.groupId,
                isVerified: query.isVerified,
                orderValue: query.orderValue,
                quantity: query.quantity,
                productId: query.productId,
                categoryId: query.categoryId,
                userRedemptionCount,
            });
            const discountAmount = result.eligible
                ? offer.calculateDiscount(query.orderValue ?? 0, query.quantity)
                : 0;
            return {
                ...result,
                discountAmount,
                offer: { id: raw.id, title: raw.title, discountType: raw.discountType, discountValue: raw.discountValue },
            };
        }
        catch (error) {
            this.logger.error(`CheckEligibilityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CheckEligibilityHandler = CheckEligibilityHandler;
exports.CheckEligibilityHandler = CheckEligibilityHandler = CheckEligibilityHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(check_eligibility_query_1.CheckEligibilityQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], CheckEligibilityHandler);
//# sourceMappingURL=check-eligibility.handler.js.map