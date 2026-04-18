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
exports.UpdatePolicyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdatePolicyDto {
}
exports.UpdatePolicyDto = UpdatePolicyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['BIDIRECTIONAL', 'DOWNLOAD_ONLY', 'UPLOAD_ONLY', 'DISABLED'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sync interval in minutes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdatePolicyDto.prototype, "syncIntervalMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max rows allowed offline (null = unlimited)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], UpdatePolicyDto.prototype, "maxRowsOffline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max storage in MB for this entity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], UpdatePolicyDto.prototype, "maxStorageMb", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max age of offline data in days' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], UpdatePolicyDto.prototype, "maxDataAgeDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['SERVER_WINS', 'CLIENT_WINS', 'LATEST_WINS', 'MERGE_FIELDS', 'MANUAL'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "conflictStrategy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['OWNED', 'TEAM', 'ALL'], description: 'Download scope' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePolicyDto.prototype, "downloadScope", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Download filter JSON' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdatePolicyDto.prototype, "downloadFilter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sync priority (1=highest, 10=lowest)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], UpdatePolicyDto.prototype, "syncPriority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable or disable this entity sync' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePolicyDto.prototype, "isEnabled", void 0);
//# sourceMappingURL=update-policy.dto.js.map