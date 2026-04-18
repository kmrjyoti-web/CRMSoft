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
var ListOffersHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOffersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_offers_query_1 = require("./list-offers.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let ListOffersHandler = ListOffersHandler_1 = class ListOffersHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(ListOffersHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { tenantId: query.tenantId, isDeleted: false };
            if (query.status)
                where.status = query.status;
            if (query.offerType)
                where.offerType = query.offerType;
            if (query.authorId)
                where.authorId = query.authorId;
            const skip = (query.page - 1) * query.limit;
            const [data, total] = await Promise.all([
                this.mktPrisma.client.mktOffer.findMany({
                    where,
                    skip,
                    take: query.limit,
                    orderBy: { createdAt: 'desc' },
                    include: { _count: { select: { redemptions: true } } },
                }),
                this.mktPrisma.client.mktOffer.count({ where }),
            ]);
            return {
                data,
                meta: {
                    total,
                    page: query.page,
                    limit: query.limit,
                    totalPages: Math.ceil(total / query.limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`ListOffersHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListOffersHandler = ListOffersHandler;
exports.ListOffersHandler = ListOffersHandler = ListOffersHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_offers_query_1.ListOffersQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], ListOffersHandler);
//# sourceMappingURL=list-offers.handler.js.map