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
exports.CreateRawContactDto = exports.CommunicationItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CommunicationItemDto {
}
exports.CommunicationItemDto = CommunicationItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'] }),
    (0, class_validator_1.IsEnum)(['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP']),
    __metadata("design:type", String)
], CommunicationItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+91-9876543210' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommunicationItemDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER']),
    __metadata("design:type", String)
], CommunicationItemDto.prototype, "priorityType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Office Phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommunicationItemDto.prototype, "label", void 0);
class CreateRawContactDto {
}
exports.CreateRawContactDto = CreateRawContactDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Vikram' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateRawContactDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sharma' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateRawContactDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['MANUAL', 'BULK_IMPORT', 'WEB_FORM', 'REFERRAL', 'API'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['MANUAL', 'BULK_IMPORT', 'WEB_FORM', 'REFERRAL', 'API']),
    __metadata("design:type", String)
], CreateRawContactDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'TechCorp India' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRawContactDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CTO' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRawContactDto.prototype, "designation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Engineering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRawContactDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRawContactDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CommunicationItemDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CommunicationItemDto),
    __metadata("design:type", Array)
], CreateRawContactDto.prototype, "communications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'LookupValue IDs for filters' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateRawContactDto.prototype, "filterIds", void 0);
//# sourceMappingURL=create-raw-contact.dto.js.map