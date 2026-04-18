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
exports.DrillDownDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../../../../common/dto/pagination.dto");
class DrillDownDto extends pagination_dto_1.PaginationDto {
}
exports.DrillDownDto = DrillDownDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dimension to drill into',
        example: 'status',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DrillDownDto.prototype, "dimension", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The specific dimension value to drill into',
        example: 'WON',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DrillDownDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date of the report period' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DrillDownDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date of the report period' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DrillDownDto.prototype, "dateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional filters as key-value pairs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DrillDownDto.prototype, "filters", void 0);
//# sourceMappingURL=drill-down.dto.js.map