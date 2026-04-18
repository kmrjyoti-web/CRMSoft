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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSlabPricesDto = exports.SetSlabPriceEntryDto = exports.BulkPriceItemDto = exports.BulkPriceUpdateDto = exports.SetPricesDto = exports.PriceEntryDto = exports.PriceTypeEnum = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var PriceTypeEnum;
(function (PriceTypeEnum) {
    PriceTypeEnum["MRP"] = "MRP";
    PriceTypeEnum["SALE_PRICE"] = "SALE_PRICE";
    PriceTypeEnum["PURCHASE_PRICE"] = "PURCHASE_PRICE";
    PriceTypeEnum["DEALER_PRICE"] = "DEALER_PRICE";
    PriceTypeEnum["DISTRIBUTOR_PRICE"] = "DISTRIBUTOR_PRICE";
    PriceTypeEnum["SPECIAL_PRICE"] = "SPECIAL_PRICE";
})(PriceTypeEnum || (exports.PriceTypeEnum = PriceTypeEnum = {}));
class PriceEntryDto {
}
exports.PriceEntryDto = PriceEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PriceTypeEnum, example: 'SALE_PRICE' }),
    (0, class_validator_1.IsEnum)(PriceTypeEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PriceEntryDto.prototype, "priceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1499.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PriceEntryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer price group UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PriceEntryDto.prototype, "priceGroupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PriceEntryDto.prototype, "minQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PriceEntryDto.prototype, "maxQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-01-01T00:00:00Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PriceEntryDto.prototype, "validFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-12-31T23:59:59Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PriceEntryDto.prototype, "validTo", void 0);
class SetPricesDto {
}
exports.SetPricesDto = SetPricesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PriceEntryDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PriceEntryDto),
    __metadata("design:type", Array)
], SetPricesDto.prototype, "prices", void 0);
class BulkPriceUpdateDto {
}
exports.BulkPriceUpdateDto = BulkPriceUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                productId: { type: 'string', format: 'uuid' },
                prices: { type: 'array', items: { $ref: '#/components/schemas/PriceEntryDto' } },
            },
        },
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkPriceItemDto),
    __metadata("design:type", Array)
], BulkPriceUpdateDto.prototype, "updates", void 0);
class BulkPriceItemDto {
}
exports.BulkPriceItemDto = BulkPriceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product UUID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BulkPriceItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PriceEntryDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PriceEntryDto),
    __metadata("design:type", Array)
], BulkPriceItemDto.prototype, "prices", void 0);
class SetSlabPriceEntryDto {
}
exports.SetSlabPriceEntryDto = SetSlabPriceEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SetSlabPriceEntryDto.prototype, "minQty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SetSlabPriceEntryDto.prototype, "maxQty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 899.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SetSlabPriceEntryDto.prototype, "amount", void 0);
class SetSlabPricesDto {
}
exports.SetSlabPricesDto = SetSlabPricesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PriceTypeEnum }),
    (0, class_validator_1.IsEnum)(PriceTypeEnum),
    __metadata("design:type", String)
], SetSlabPricesDto.prototype, "priceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SetSlabPriceEntryDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SetSlabPriceEntryDto),
    __metadata("design:type", Array)
], SetSlabPricesDto.prototype, "slabs", void 0);
//# sourceMappingURL=set-prices.dto.js.map