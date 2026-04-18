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
exports.FilterSearchDto = exports.CopyFiltersDto = exports.ReplaceFiltersDto = exports.AssignFiltersDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const entity_filter_types_1 = require("../../entity-filter.types");
class AssignFiltersDto {
}
exports.AssignFiltersDto = AssignFiltersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'LookupValue IDs to assign' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], AssignFiltersDto.prototype, "lookupValueIds", void 0);
class ReplaceFiltersDto {
}
exports.ReplaceFiltersDto = ReplaceFiltersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'New LookupValue IDs (replaces existing)' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], ReplaceFiltersDto.prototype, "lookupValueIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'LEAD_TYPE', description: 'Only replace values from this category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplaceFiltersDto.prototype, "category", void 0);
class CopyFiltersDto {
}
exports.CopyFiltersDto = CopyFiltersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entity_filter_types_1.VALID_ENTITY_TYPES }),
    (0, class_validator_1.IsEnum)(entity_filter_types_1.VALID_ENTITY_TYPES),
    __metadata("design:type", String)
], CopyFiltersDto.prototype, "targetType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CopyFiltersDto.prototype, "targetId", void 0);
class FilterSearchDto {
}
exports.FilterSearchDto = FilterSearchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'LookupValue IDs to search by' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], FilterSearchDto.prototype, "lookupValueIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false, description: 'true=AND (all filters), false=OR (any filter)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FilterSearchDto.prototype, "matchAll", void 0);
//# sourceMappingURL=entity-filter.dto.js.map