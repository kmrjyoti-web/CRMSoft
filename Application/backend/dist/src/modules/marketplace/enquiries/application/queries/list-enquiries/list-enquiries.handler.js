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
var ListEnquiriesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEnquiriesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_enquiries_query_1 = require("./list-enquiries.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let ListEnquiriesHandler = ListEnquiriesHandler_1 = class ListEnquiriesHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(ListEnquiriesHandler_1.name);
    }
    async execute(query) {
        try {
            const where = { tenantId: query.tenantId, isDeleted: false };
            if (query.listingId)
                where.listingId = query.listingId;
            if (query.enquirerId)
                where.enquirerId = query.enquirerId;
            if (query.status)
                where.status = query.status;
            const skip = (query.page - 1) * query.limit;
            const [data, total] = await Promise.all([
                this.mktPrisma.client.mktEnquiry.findMany({
                    where,
                    skip,
                    take: query.limit,
                    orderBy: { createdAt: 'desc' },
                    include: { listing: { select: { id: true, title: true, basePrice: true } } },
                }),
                this.mktPrisma.client.mktEnquiry.count({ where }),
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
            this.logger.error(`ListEnquiriesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListEnquiriesHandler = ListEnquiriesHandler;
exports.ListEnquiriesHandler = ListEnquiriesHandler = ListEnquiriesHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_enquiries_query_1.ListEnquiriesQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], ListEnquiriesHandler);
//# sourceMappingURL=list-enquiries.handler.js.map