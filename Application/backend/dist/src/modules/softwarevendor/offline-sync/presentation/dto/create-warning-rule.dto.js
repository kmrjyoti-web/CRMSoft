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
exports.CreateWarningRuleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateWarningRuleDto {
}
exports.CreateWarningRuleDto = CreateWarningRuleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Policy ID (null for global rule)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "policyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rule name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['TIME_SINCE_SYNC', 'DATA_AGE', 'PENDING_UPLOAD_COUNT', 'PENDING_UPLOAD_AGE', 'STORAGE_SIZE', 'ENTITY_SPECIFIC'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "trigger", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Base threshold value' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWarningRuleDto.prototype, "thresholdValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Threshold unit: hours, days, count, mb' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "thresholdUnit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['WARN_ONLY', 'BLOCK_AFTER_DELAY', 'BLOCK_UNTIL_SYNC', 'FLUSH_AND_RESYNC'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "level1Action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWarningRuleDto.prototype, "level1Threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "level1Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['WARN_ONLY', 'BLOCK_AFTER_DELAY', 'BLOCK_UNTIL_SYNC', 'FLUSH_AND_RESYNC'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "level2Action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWarningRuleDto.prototype, "level2Threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "level2Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delay in minutes for BLOCK_AFTER_DELAY' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateWarningRuleDto.prototype, "level2DelayMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['WARN_ONLY', 'BLOCK_AFTER_DELAY', 'BLOCK_UNTIL_SYNC', 'FLUSH_AND_RESYNC'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "level3Action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWarningRuleDto.prototype, "level3Threshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWarningRuleDto.prototype, "level3Message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Apply to specific roles (empty = all)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateWarningRuleDto.prototype, "appliesToRoles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Apply to specific users (empty = all)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateWarningRuleDto.prototype, "appliesToUsers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Priority (lower = evaluated first)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateWarningRuleDto.prototype, "priority", void 0);
//# sourceMappingURL=create-warning-rule.dto.js.map