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
exports.IssueFlushDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class IssueFlushDto {
}
exports.IssueFlushDto = IssueFlushDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FULL', 'ENTITY', 'DEVICE'], description: 'Type of flush' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssueFlushDto.prototype, "flushType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target user ID (null = all users)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssueFlushDto.prototype, "targetUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target device ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssueFlushDto.prototype, "targetDeviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Target entity to flush (required for ENTITY type)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssueFlushDto.prototype, "targetEntity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for flush' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssueFlushDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true, description: 'Re-download data after flush?' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], IssueFlushDto.prototype, "redownloadAfter", void 0);
//# sourceMappingURL=issue-flush.dto.js.map