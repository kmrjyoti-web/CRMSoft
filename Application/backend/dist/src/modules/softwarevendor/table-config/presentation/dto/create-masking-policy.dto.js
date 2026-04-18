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
exports.UpdateMaskingPolicyDto = exports.CreateMaskingPolicyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateMaskingPolicyDto {
}
exports.CreateMaskingPolicyDto = CreateMaskingPolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contacts' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaskingPolicyDto.prototype, "tableKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'email' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaskingPolicyDto.prototype, "columnId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Role to apply policy to (null = all roles)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaskingPolicyDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User to apply policy to (null = all users in role)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaskingPolicyDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PARTIAL', enum: ['FULL', 'PARTIAL', 'NONE'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['FULL', 'PARTIAL', 'NONE']),
    __metadata("design:type", String)
], CreateMaskingPolicyDto.prototype, "maskType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Allow user to unmask per-row' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMaskingPolicyDto.prototype, "canUnmask", void 0);
class UpdateMaskingPolicyDto {
}
exports.UpdateMaskingPolicyDto = UpdateMaskingPolicyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['FULL', 'PARTIAL', 'NONE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['FULL', 'PARTIAL', 'NONE']),
    __metadata("design:type", String)
], UpdateMaskingPolicyDto.prototype, "maskType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMaskingPolicyDto.prototype, "canUnmask", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMaskingPolicyDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-masking-policy.dto.js.map