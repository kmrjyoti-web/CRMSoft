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
exports.CheckAreaDto = exports.AddPincodeRangeDto = exports.AddPincodesDto = exports.PincodeItemDto = exports.AddCitiesDto = exports.CityItemDto = exports.AddStatesDto = exports.StateItemDto = exports.AddCountryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class AddCountryDto {
}
exports.AddCountryDto = AddCountryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'IN' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCountryDto.prototype, "countryCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AddCountryDto.prototype, "isPrimary", void 0);
class StateItemDto {
}
exports.StateItemDto = StateItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MH' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StateItemDto.prototype, "stateCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ALL_CITIES', 'SPECIFIC'], default: 'SPECIFIC' }),
    (0, class_validator_1.IsEnum)(['ALL_CITIES', 'SPECIFIC']),
    __metadata("design:type", String)
], StateItemDto.prototype, "coverageType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StateItemDto.prototype, "isHeadquarter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '27AAACR1234A1ZM' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StateItemDto.prototype, "stateGstin", void 0);
class AddStatesDto {
}
exports.AddStatesDto = AddStatesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StateItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StateItemDto),
    __metadata("design:type", Array)
], AddStatesDto.prototype, "states", void 0);
class CityItemDto {
}
exports.CityItemDto = CityItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mumbai' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CityItemDto.prototype, "cityName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ALL_PINCODES', 'SPECIFIC'], default: 'ALL_PINCODES' }),
    (0, class_validator_1.IsEnum)(['ALL_PINCODES', 'SPECIFIC']),
    __metadata("design:type", String)
], CityItemDto.prototype, "coverageType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CityItemDto.prototype, "district", void 0);
class AddCitiesDto {
}
exports.AddCitiesDto = AddCitiesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CityItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CityItemDto),
    __metadata("design:type", Array)
], AddCitiesDto.prototype, "cities", void 0);
class PincodeItemDto {
}
exports.PincodeItemDto = PincodeItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '411001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PincodeItemDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Shivajinagar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PincodeItemDto.prototype, "areaName", void 0);
class AddPincodesDto {
}
exports.AddPincodesDto = AddPincodesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PincodeItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PincodeItemDto),
    __metadata("design:type", Array)
], AddPincodesDto.prototype, "pincodes", void 0);
class AddPincodeRangeDto {
}
exports.AddPincodeRangeDto = AddPincodeRangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '411001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddPincodeRangeDto.prototype, "fromPincode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '411050' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddPincodeRangeDto.prototype, "toPincode", void 0);
class CheckAreaDto {
}
exports.CheckAreaDto = CheckAreaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '411001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckAreaDto.prototype, "customerPincode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MH' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckAreaDto.prototype, "customerStateCode", void 0);
//# sourceMappingURL=company-locations.dto.js.map