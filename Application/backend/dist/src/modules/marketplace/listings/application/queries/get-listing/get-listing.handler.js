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
var GetListingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetListingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_listing_query_1 = require("./get-listing.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let GetListingHandler = GetListingHandler_1 = class GetListingHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(GetListingHandler_1.name);
    }
    async execute(query) {
        try {
            const listing = await this.mktPrisma.client.mktListing.findFirst({
                where: { id: query.id, tenantId: query.tenantId, isDeleted: false },
                include: {
                    priceTiers: true,
                    analyticsSummary: true,
                    _count: {
                        select: { reviews: true, enquiries: true },
                    },
                },
            });
            if (!listing) {
                throw new common_1.NotFoundException(`Listing ${query.id} not found`);
            }
            return listing;
        }
        catch (error) {
            this.logger.error(`GetListingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetListingHandler = GetListingHandler;
exports.GetListingHandler = GetListingHandler = GetListingHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_listing_query_1.GetListingQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], GetListingHandler);
//# sourceMappingURL=get-listing.handler.js.map