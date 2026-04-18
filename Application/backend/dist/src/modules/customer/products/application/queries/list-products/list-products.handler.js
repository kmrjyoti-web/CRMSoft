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
var ListProductsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProductsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const list_products_query_1 = require("./list-products.query");
let ListProductsHandler = ListProductsHandler_1 = class ListProductsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListProductsHandler_1.name);
    }
    async execute(query) {
        try {
            const { page, limit, sortBy, sortDir, search, status, parentId, isMaster, brandId, manufacturerId, minPrice, maxPrice, taxType, licenseRequired, tags, } = query;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { code: { contains: search, mode: 'insensitive' } },
                    { shortDescription: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (status)
                where.status = status;
            if (parentId)
                where.parentId = parentId;
            if (isMaster !== undefined)
                where.isMaster = isMaster;
            if (brandId)
                where.brandId = brandId;
            if (manufacturerId)
                where.manufacturerId = manufacturerId;
            if (taxType)
                where.taxType = taxType;
            if (licenseRequired !== undefined)
                where.licenseRequired = licenseRequired;
            if (minPrice !== undefined || maxPrice !== undefined) {
                where.salePrice = {};
                if (minPrice !== undefined)
                    where.salePrice.gte = minPrice;
                if (maxPrice !== undefined)
                    where.salePrice.lte = maxPrice;
            }
            if (tags) {
                const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
                if (tagArray.length > 0) {
                    where.tags = { hasSome: tagArray };
                }
            }
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.prisma.working.product.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortDir },
                    include: {
                        parent: { select: { id: true, name: true } },
                        brand: { select: { id: true, name: true, code: true } },
                        manufacturer: { select: { id: true, name: true, code: true } },
                        _count: { select: { children: true } },
                    },
                }),
                this.prisma.working.product.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`ListProductsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListProductsHandler = ListProductsHandler;
exports.ListProductsHandler = ListProductsHandler = ListProductsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_products_query_1.ListProductsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListProductsHandler);
//# sourceMappingURL=list-products.handler.js.map