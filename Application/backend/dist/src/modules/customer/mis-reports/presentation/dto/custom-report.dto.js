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
exports.SaveCustomReportDto = exports.CustomReportDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CustomReportDto {
}
exports.CustomReportDto = CustomReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity to query', enum: ['LEAD', 'CONTACT', 'ORGANIZATION', 'ACTIVITY', 'DEMO', 'QUOTATION', 'TOUR_PLAN'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomReportDto.prototype, "entity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date (ISO 8601)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CustomReportDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date (ISO 8601)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CustomReportDto.prototype, "dateTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Columns to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CustomReportDto.prototype, "columns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional filters on the entity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CustomReportDto.prototype, "entityFilters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Field to group by' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomReportDto.prototype, "groupByField", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Aggregations to apply', type: [Object] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CustomReportDto.prototype, "aggregations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Field to sort by' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomReportDto.prototype, "sortByField", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort direction', enum: ['asc', 'desc'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomReportDto.prototype, "sortDirection", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Chart type for visualization', enum: ['BAR', 'LINE', 'PIE', 'DONUT'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomReportDto.prototype, "chartType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number (1-based)', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CustomReportDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Records per page', default: 50 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CustomReportDto.prototype, "limit", void 0);
class SaveCustomReportDto {
}
exports.SaveCustomReportDto = SaveCustomReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bookmark name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveCustomReportDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveCustomReportDto.prototype, "entity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Columns to include' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SaveCustomReportDto.prototype, "columns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Entity-specific filters' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SaveCustomReportDto.prototype, "entityFilters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Group by field' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveCustomReportDto.prototype, "groupByField", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Aggregations' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SaveCustomReportDto.prototype, "aggregations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort field' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveCustomReportDto.prototype, "sortByField", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort direction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveCustomReportDto.prototype, "sortDirection", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Chart type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveCustomReportDto.prototype, "chartType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pin to dashboard' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SaveCustomReportDto.prototype, "isPinned", void 0);
//# sourceMappingURL=custom-report.dto.js.map