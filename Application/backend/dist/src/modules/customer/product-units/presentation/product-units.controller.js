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
exports.ProductUnitsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const unit_converter_service_1 = require("../services/unit-converter.service");
const product_unit_dto_1 = require("./dto/product-unit.dto");
const UNIT_TYPES = [
    'PIECE', 'BOX', 'PACK', 'CARTON', 'KG', 'GRAM', 'LITRE', 'ML',
    'METER', 'CM', 'SQ_FT', 'SQ_METER', 'DOZEN', 'SET', 'PAIR',
    'ROLL', 'BUNDLE',
];
const UNIT_LABELS = {
    PIECE: 'Piece', BOX: 'Box', PACK: 'Pack', CARTON: 'Carton',
    KG: 'Kilogram', GRAM: 'Gram', LITRE: 'Litre', ML: 'Millilitre',
    METER: 'Meter', CM: 'Centimeter', SQ_FT: 'Square Foot',
    SQ_METER: 'Square Meter', DOZEN: 'Dozen', SET: 'Set',
    PAIR: 'Pair', ROLL: 'Roll', BUNDLE: 'Bundle',
};
let ProductUnitsController = class ProductUnitsController {
    constructor(prisma, unitConverter) {
        this.prisma = prisma;
        this.unitConverter = unitConverter;
    }
    async setConversions(productId, dto) {
        const results = [];
        for (const c of dto.conversions) {
            const existing = await this.prisma.working.productUnitConversion.findFirst({
                where: {
                    productId,
                    fromUnit: c.fromUnit,
                    toUnit: c.toUnit,
                },
            });
            let record;
            if (existing) {
                record = await this.prisma.working.productUnitConversion.update({
                    where: { id: existing.id },
                    data: {
                        conversionRate: c.conversionRate,
                        isDefault: c.isDefault ?? false,
                    },
                });
            }
            else {
                record = await this.prisma.working.productUnitConversion.create({
                    data: {
                        productId,
                        fromUnit: c.fromUnit,
                        toUnit: c.toUnit,
                        conversionRate: c.conversionRate,
                        isDefault: c.isDefault ?? false,
                    },
                });
            }
            results.push(record);
        }
        return api_response_1.ApiResponse.success(results, `${results.length} conversion(s) set`);
    }
    async getConversions(productId) {
        const conversions = await this.prisma.working.productUnitConversion.findMany({
            where: { productId },
            orderBy: { fromUnit: 'asc' },
        });
        return api_response_1.ApiResponse.success(conversions);
    }
    async convert(dto) {
        const result = await this.unitConverter.convert(this.prisma, {
            productId: dto.productId,
            quantity: dto.quantity,
            fromUnit: dto.fromUnit,
            toUnit: dto.toUnit,
        });
        return api_response_1.ApiResponse.success(result, 'Conversion complete');
    }
    async getTypes() {
        const types = UNIT_TYPES.map((value) => ({
            value,
            label: UNIT_LABELS[value] || value,
        }));
        return api_response_1.ApiResponse.success(types);
    }
    async removeConversion(conversionId) {
        await this.prisma.working.productUnitConversion.delete({
            where: { id: conversionId },
        });
        return api_response_1.ApiResponse.success(null, 'Conversion removed');
    }
};
exports.ProductUnitsController = ProductUnitsController;
__decorate([
    (0, common_1.Post)(':productId/conversions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set unit conversions for product (upsert)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_unit_dto_1.SetConversionsDto]),
    __metadata("design:returntype", Promise)
], ProductUnitsController.prototype, "setConversions", null);
__decorate([
    (0, common_1.Get)(':productId/conversions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all conversions for product' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductUnitsController.prototype, "getConversions", null);
__decorate([
    (0, common_1.Post)('convert'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Convert quantity between units' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_unit_dto_1.ConvertDto]),
    __metadata("design:returntype", Promise)
], ProductUnitsController.prototype, "convert", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({ summary: 'List all UnitType enum values' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductUnitsController.prototype, "getTypes", null);
__decorate([
    (0, common_1.Delete)('conversions/:conversionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a unit conversion' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    __param(0, (0, common_1.Param)('conversionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductUnitsController.prototype, "removeConversion", null);
exports.ProductUnitsController = ProductUnitsController = __decorate([
    (0, swagger_1.ApiTags)('Product Units'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('units'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        unit_converter_service_1.UnitConverterService])
], ProductUnitsController);
//# sourceMappingURL=product-units.controller.js.map