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
var GetOfferHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOfferHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_offer_query_1 = require("./get-offer.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let GetOfferHandler = GetOfferHandler_1 = class GetOfferHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(GetOfferHandler_1.name);
    }
    async execute(query) {
        try {
            const offer = await this.mktPrisma.client.mktOffer.findFirst({
                where: { id: query.id, tenantId: query.tenantId, isDeleted: false },
                include: {
                    analyticsSummary: true,
                    _count: { select: { redemptions: true } },
                },
            });
            if (!offer)
                throw new common_1.NotFoundException(`Offer ${query.id} not found`);
            return offer;
        }
        catch (error) {
            this.logger.error(`GetOfferHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetOfferHandler = GetOfferHandler;
exports.GetOfferHandler = GetOfferHandler = GetOfferHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_offer_query_1.GetOfferQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], GetOfferHandler);
//# sourceMappingURL=get-offer.handler.js.map