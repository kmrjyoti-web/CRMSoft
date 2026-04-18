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
var ListListingsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListListingsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_listings_query_1 = require("./list-listings.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let ListListingsHandler = ListListingsHandler_1 = class ListListingsHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(ListListingsHandler_1.name);
    }
    async execute(query) {
        try {
            const where = {
                tenantId: query.tenantId,
                isDeleted: false,
            };
            if (query.status)
                where.status = query.status;
            if (query.listingType)
                where.listingType = query.listingType;
            if (query.categoryId)
                where.categoryId = query.categoryId;
            if (query.authorId)
                where.authorId = query.authorId;
            if (query.search) {
                where.OR = [
                    { title: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            const skip = (query.page - 1) * query.limit;
            const [data, total] = await Promise.all([
                this.mktPrisma.client.mktListing.findMany({
                    where,
                    skip,
                    take: query.limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        priceTiers: { take: 3 },
                        _count: { select: { reviews: true, enquiries: true } },
                    },
                }),
                this.mktPrisma.client.mktListing.count({ where }),
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
            this.logger.error(`ListListingsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListListingsHandler = ListListingsHandler;
exports.ListListingsHandler = ListListingsHandler = ListListingsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_listings_query_1.ListListingsQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], ListListingsHandler);
//# sourceMappingURL=list-listings.handler.js.map