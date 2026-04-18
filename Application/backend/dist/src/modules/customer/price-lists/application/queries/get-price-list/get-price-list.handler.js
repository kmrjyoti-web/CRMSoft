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
var GetPriceListHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPriceListHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_price_list_query_1 = require("./get-price-list.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let GetPriceListHandler = GetPriceListHandler_1 = class GetPriceListHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetPriceListHandler_1.name);
    }
    async execute(q) {
        try {
            const pl = await this.prisma.working.priceList.findFirst({
                where: { id: q.id, isDeleted: false },
                include: { items: { orderBy: { minQuantity: 'asc' } } },
            });
            if (!pl)
                throw new common_1.NotFoundException('PriceList not found');
            return pl;
        }
        catch (error) {
            this.logger.error(`GetPriceListHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetPriceListHandler = GetPriceListHandler;
exports.GetPriceListHandler = GetPriceListHandler = GetPriceListHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_price_list_query_1.GetPriceListQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetPriceListHandler);
//# sourceMappingURL=get-price-list.handler.js.map