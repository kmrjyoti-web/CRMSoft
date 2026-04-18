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
var ListRequirementsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRequirementsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_requirements_query_1 = require("./list-requirements.query");
const mkt_prisma_service_1 = require("../../../infrastructure/mkt-prisma.service");
let ListRequirementsHandler = ListRequirementsHandler_1 = class ListRequirementsHandler {
    constructor(mktPrisma) {
        this.mktPrisma = mktPrisma;
        this.logger = new common_1.Logger(ListRequirementsHandler_1.name);
    }
    async execute(query) {
        try {
            const { tenantId, page, limit, categoryId, authorId, search } = query;
            const skip = (page - 1) * limit;
            const where = {
                tenantId,
                listingType: 'REQUIREMENT',
                isDeleted: false,
                status: 'ACTIVE',
            };
            if (categoryId)
                where.categoryId = categoryId;
            if (authorId)
                where.authorId = authorId;
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }
            const [data, total] = await Promise.all([
                this.mktPrisma.client.mktListing.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.mktPrisma.client.mktListing.count({ where }),
            ]);
            return {
                data,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
        }
        catch (error) {
            this.logger.error(`ListRequirementsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListRequirementsHandler = ListRequirementsHandler;
exports.ListRequirementsHandler = ListRequirementsHandler = ListRequirementsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_requirements_query_1.ListRequirementsQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mkt_prisma_service_1.MktPrismaService])
], ListRequirementsHandler);
//# sourceMappingURL=list-requirements.handler.js.map