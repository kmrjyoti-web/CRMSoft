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
exports.CalculateGstDto = exports.SetTaxDetailsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class TaxDetailItem {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CGST' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaxDetailItem.prototype, "taxName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 9 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TaxDetailItem.prototype, "taxRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Central GST at 9%' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaxDetailItem.prototype, "description", void 0);
class SetTaxDetailsDto {
}
exports.SetTaxDetailsDto = SetTaxDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TaxDetailItem] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TaxDetailItem),
    __metadata("design:type", Array)
], SetTaxDetailsDto.prototype, "taxes", void 0);
class CalculateGstDto {
}
exports.CalculateGstDto = CalculateGstDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculateGstDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 18 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculateGstDto.prototype, "gstRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculateGstDto.prototype, "cessRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CalculateGstDto.prototype, "isInterState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CalculateGstDto.prototype, "taxInclusive", void 0);
//# sourceMappingURL=product-tax.dto.js.map