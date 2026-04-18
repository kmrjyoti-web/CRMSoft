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
exports.DailyDigestSettingsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class DailyDigestSettingsDto {
}
exports.DailyDigestSettingsDto = DailyDigestSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient email addresses', type: [String] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], DailyDigestSettingsDto.prototype, "recipientEmails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Recipient user IDs (internal users)', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], DailyDigestSettingsDto.prototype, "recipientUserIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delivery time in HH:mm format (IST)', default: '08:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyDigestSettingsDto.prototype, "timeOfDay", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Export format for the digest', enum: ['XLSX', 'CSV', 'PDF'], default: 'PDF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DailyDigestSettingsDto.prototype, "format", void 0);
//# sourceMappingURL=daily-digest-settings.dto.js.map