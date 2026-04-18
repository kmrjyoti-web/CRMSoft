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
exports.PushChangesDto = exports.OfflineChangeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class OfflineChangeDto {
}
exports.OfflineChangeDto = OfflineChangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity name (e.g., "Lead", "Contact")' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfflineChangeDto.prototype, "entityName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Entity ID (required for UPDATE/DELETE, null for CREATE)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfflineChangeDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfflineChangeDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Record data' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], OfflineChangeDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Values before offline edit (for UPDATE)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], OfflineChangeDto.prototype, "previousValues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When change was made offline (ISO)' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], OfflineChangeDto.prototype, "clientTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Incrementing version per record' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], OfflineChangeDto.prototype, "clientVersion", void 0);
class PushChangesDto {
}
exports.PushChangesDto = PushChangesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device identifier' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PushChangesDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OfflineChangeDto], description: 'Offline changes to push' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OfflineChangeDto),
    __metadata("design:type", Array)
], PushChangesDto.prototype, "changes", void 0);
//# sourceMappingURL=push-changes.dto.js.map