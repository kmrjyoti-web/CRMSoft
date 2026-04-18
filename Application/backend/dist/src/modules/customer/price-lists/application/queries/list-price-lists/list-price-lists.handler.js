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
var ListPriceListsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPriceListsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_price_lists_query_1 = require("./list-price-lists.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let ListPriceListsHandler = ListPriceListsHandler_1 = class ListPriceListsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ListPriceListsHandler_1.name);
    }
    async execute(q) {
        try {
            const where = { isDeleted: false };
            if (q.search)
                where.name = { contains: q.search, mode: 'insensitive' };
            if (q.isActive !== undefined)
                where.isActive = q.isActive;
            const page = Math.max(1, +q.page || 1);
            const limit = Math.min(100, +q.limit || 20);
            const [data, total] = await Promise.all([
                this.prisma.working.priceList.findMany({
                    where,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { priority: 'asc' },
                    include: { _count: { select: { items: true } } },
                }),
                this.prisma.working.priceList.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        catch (error) {
            this.logger.error(`ListPriceListsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListPriceListsHandler = ListPriceListsHandler;
exports.ListPriceListsHandler = ListPriceListsHandler = ListPriceListsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_price_lists_query_1.ListPriceListsQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListPriceListsHandler);
//# sourceMappingURL=list-price-lists.handler.js.map