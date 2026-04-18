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
exports.ConvertDto = exports.SetConversionsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const UnitType = [
    'PIECE', 'BOX', 'PACK', 'CARTON', 'KG', 'GRAM', 'LITRE', 'ML',
    'METER', 'CM', 'SQ_FT', 'SQ_METER', 'DOZEN', 'SET', 'PAIR',
    'ROLL', 'BUNDLE',
];
class ConversionItem {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BOX', enum: UnitType }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversionItem.prototype, "fromUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PIECE', enum: UnitType }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConversionItem.prototype, "toUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0001),
    __metadata("design:type", Number)
], ConversionItem.prototype, "conversionRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConversionItem.prototype, "isDefault", void 0);
class SetConversionsDto {
}
exports.SetConversionsDto = SetConversionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ConversionItem] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConversionItem),
    __metadata("design:type", Array)
], SetConversionsDto.prototype, "conversions", void 0);
class ConvertDto {
}
exports.ConvertDto = ConvertDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ConvertDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ConvertDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BOX', enum: UnitType }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConvertDto.prototype, "fromUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PIECE', enum: UnitType }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConvertDto.prototype, "toUnit", void 0);
//# sourceMappingURL=product-unit.dto.js.map