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
exports.ProductTaxController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const gst_calculator_service_1 = require("../services/gst-calculator.service");
const product_tax_dto_1 = require("./dto/product-tax.dto");
let ProductTaxController = class ProductTaxController {
    constructor(prisma, gstCalculator) {
        this.prisma = prisma;
        this.gstCalculator = gstCalculator;
    }
    async setTaxDetails(productId, dto) {
        await this.prisma.working.productTaxDetail.deleteMany({ where: { productId } });
        const details = await this.prisma.working.productTaxDetail.createMany({
            data: dto.taxes.map((t) => ({
                productId,
                taxName: t.taxName,
                taxRate: t.taxRate,
                description: t.description,
            })),
        });
        const created = await this.prisma.working.productTaxDetail.findMany({
            where: { productId },
            orderBy: { taxName: 'asc' },
        });
        return api_response_1.ApiResponse.success(created, `${details.count} tax detail(s) set`);
    }
    async getTaxDetails(productId) {
        const details = await this.prisma.working.productTaxDetail.findMany({
            where: { productId },
            orderBy: { taxName: 'asc' },
        });
        return api_response_1.ApiResponse.success(details);
    }
    async calculateGst(dto) {
        const breakup = this.gstCalculator.calculateGST({
            amount: dto.amount,
            gstRate: dto.gstRate,
            cessRate: dto.cessRate,
            isInterState: dto.isInterState,
            taxInclusive: dto.taxInclusive,
        });
        return api_response_1.ApiResponse.success(breakup, 'GST calculated');
    }
    async hsnLookup(code) {
        const result = {
            hsnCode: code || '8471',
            suggestedRate: 18,
            description: 'Computers and related',
        };
        return api_response_1.ApiResponse.success(result, 'HSN lookup result');
    }
};
exports.ProductTaxController = ProductTaxController;
__decorate([
    (0, common_1.Post)(':productId/details'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set tax details for product (replace all)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:update'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_tax_dto_1.SetTaxDetailsDto]),
    __metadata("design:returntype", Promise)
], ProductTaxController.prototype, "setTaxDetails", null);
__decorate([
    (0, common_1.Get)(':productId/details'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tax details for product' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductTaxController.prototype, "getTaxDetails", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate GST breakup for given amount' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_tax_dto_1.CalculateGstDto]),
    __metadata("design:returntype", Promise)
], ProductTaxController.prototype, "calculateGst", null);
__decorate([
    (0, common_1.Get)('hsn-lookup'),
    (0, swagger_1.ApiOperation)({ summary: 'Lookup HSN code (placeholder)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('products:read'),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductTaxController.prototype, "hsnLookup", null);
exports.ProductTaxController = ProductTaxController = __decorate([
    (0, swagger_1.ApiTags)('Product Tax'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tax'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        gst_calculator_service_1.ProductTaxGstCalculatorService])
], ProductTaxController);
//# sourceMappingURL=product-tax.controller.js.map