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
var GetProductPricingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductPricingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_product_pricing_query_1 = require("./get-product-pricing.query");
let GetProductPricingHandler = GetProductPricingHandler_1 = class GetProductPricingHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetProductPricingHandler_1.name);
    }
    async execute(query) {
        try {
            const product = await this.prisma.working.product.findUnique({
                where: { id: query.productId },
                select: { id: true },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${query.productId}" not found`);
            }
            const prices = await this.prisma.working.productPrice.findMany({
                where: { productId: query.productId, isActive: true },
                include: {
                    priceGroup: { select: { id: true, name: true, code: true } },
                },
                orderBy: [{ priceType: 'asc' }, { amount: 'asc' }],
            });
            const grouped = {};
            for (const price of prices) {
                const key = price.priceType;
                if (!grouped[key])
                    grouped[key] = [];
                grouped[key].push(price);
            }
            return { productId: query.productId, prices, grouped };
        }
        catch (error) {
            this.logger.error(`GetProductPricingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetProductPricingHandler = GetProductPricingHandler;
exports.GetProductPricingHandler = GetProductPricingHandler = GetProductPricingHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_product_pricing_query_1.GetProductPricingQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetProductPricingHandler);
//# sourceMappingURL=get-product-pricing.handler.js.map