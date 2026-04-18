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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductPricingController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const set_prices_dto_1 = require("./dto/set-prices.dto");
const get_effective_price_dto_1 = require("./dto/get-effective-price.dto");
const set_product_prices_command_1 = require("../application/commands/set-product-prices/set-product-prices.command");
const set_group_price_command_1 = require("../application/commands/set-group-price/set-group-price.command");
const set_slab_price_command_1 = require("../application/commands/set-slab-price/set-slab-price.command");
const get_effective_price_query_1 = require("../application/queries/get-effective-price/get-effective-price.query");
const get_price_list_query_1 = require("../application/queries/get-price-list/get-price-list.query");
let ProductPricingController = class ProductPricingController {
    constructor(commandBus, queryBus, prisma) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async setPrices(productId, dto) {
        const result = await this.commandBus.execute(new set_product_prices_command_1.SetProductPricesCommand(productId, dto.prices));
        return api_response_1.ApiResponse.success(result, 'Prices set');
    }
    async setGroupPrice(productId, body) {
        const result = await this.commandBus.execute(new set_group_price_command_1.SetGroupPriceCommand(productId, body.priceGroupId, body.priceType, body.amount));
        return api_response_1.ApiResponse.success(result, 'Group price set');
    }
    async setSlabPrices(productId, dto) {
        const result = await this.commandBus.execute(new set_slab_price_command_1.SetSlabPriceCommand(productId, dto.priceType, dto.slabs));
        return api_response_1.ApiResponse.success(result, 'Slab prices set');
    }
    async getPriceList(productId) {
        const result = await this.queryBus.execute(new get_price_list_query_1.GetPriceListQuery(productId));
        return api_response_1.ApiResponse.success(result);
    }
    async getEffectivePrice(dto) {
        const result = await this.queryBus.execute(new get_effective_price_query_1.GetEffectivePriceQuery(dto.productId, dto.contactId, dto.organizationId, dto.quantity, dto.isInterState));
        return api_response_1.ApiResponse.success(result);
    }
    async getProductPrices(productId, priceType, groupId) {
        const result = await this.queryBus.execute(new get_price_list_query_1.GetPriceListQuery(productId));
        return api_response_1.ApiResponse.success(result);
    }
    async bulkUpdate(dto) {
        const results = [];
        for (const item of dto.updates) {
            const result = await this.commandBus.execute(new set_product_prices_command_1.SetProductPricesCommand(item.productId, item.prices));
            results.push(result);
        }
        return api_response_1.ApiResponse.success(results, `${results.length} product(s) updated`);
    }
    async comparePrices(productIds) {
        const ids = productIds.split(',').map((s) => s.trim()).filter(Boolean);
        const products = await this.prisma.working.product.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, code: true, mrp: true, salePrice: true },
        });
        const prices = await this.prisma.working.productPrice.findMany({
            where: {
                productId: { in: ids }, isActive: true,
                priceGroupId: null,
                OR: [{ minQty: null }, { minQty: 0 }],
            },
            orderBy: [{ priceType: 'asc' }],
        });
        const priceMap = new Map();
        for (const p of prices) {
            if (!priceMap.has(p.productId))
                priceMap.set(p.productId, []);
            priceMap.get(p.productId).push({
                priceType: p.priceType, amount: p.amount, currency: p.currency,
            });
        }
        const comparison = products.map((prod) => ({
            productId: prod.id, productName: prod.name, productCode: prod.code,
            mrp: prod.mrp, salePrice: prod.salePrice,
            prices: priceMap.get(prod.id) ?? [],
        }));
        return api_response_1.ApiResponse.success(comparison, 'Price comparison');
    }
    async removePrice(priceId) {
        await this.prisma.working.productPrice.update({
            where: { id: priceId },
            data: { isActive: false },
        });
        return api_response_1.ApiResponse.success(null, 'Price removed');
    }
};
exports.ProductPricingController = ProductPricingController;
__decorate([
    (0, common_1.Post)(':productId/prices'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set product prices (upsert batch)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:update'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_prices_dto_1.SetPricesDto]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "setPrices", null);
__decorate([
    (0, common_1.Post)(':productId/group-price'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set a group-specific price' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:update'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "setGroupPrice", null);
__decorate([
    (0, common_1.Post)(':productId/slab-prices'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set slab pricing' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:update'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_prices_dto_1.SetSlabPricesDto]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "setSlabPrices", null);
__decorate([
    (0, common_1.Get)(':productId/price-list'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full price list for product' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:read'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "getPriceList", null);
__decorate([
    (0, common_1.Post)('effective-price'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate effective price with GST breakup' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_effective_price_dto_1.GetEffectivePriceDto]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "getEffectivePrice", null);
__decorate([
    (0, common_1.Get)(':productId/prices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all prices for product (filterable)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:read'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('priceType')),
    __param(2, (0, common_1.Query)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "getProductPrices", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update prices for multiple products' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [set_prices_dto_1.BulkPriceUpdateDto]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Get)('compare'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare base prices across products' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:read'),
    __param(0, (0, common_1.Query)('productIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "comparePrices", null);
__decorate([
    (0, common_1.Delete)(':priceId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a specific price entry' }),
    (0, require_permissions_decorator_1.RequirePermissions)('product_pricing:update'),
    __param(0, (0, common_1.Param)('priceId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductPricingController.prototype, "removePrice", null);
exports.ProductPricingController = ProductPricingController = __decorate([
    (0, swagger_1.ApiTags)('Product Pricing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('pricing'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], ProductPricingController);
//# sourceMappingURL=product-pricing.controller.js.map