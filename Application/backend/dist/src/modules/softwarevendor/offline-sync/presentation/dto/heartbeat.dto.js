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
exports.HeartbeatDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class HeartbeatDto {
}
exports.HeartbeatDto = HeartbeatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Device identifier' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HeartbeatDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of pending unsynced changes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HeartbeatDto.prototype, "pendingUploadCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Storage used in MB' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], HeartbeatDto.prototype, "storageUsedMb", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Record counts per entity: { "Contact": 450, "Lead": 120 }' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], HeartbeatDto.prototype, "recordCounts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Per-entity sync timestamps' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], HeartbeatDto.prototype, "entitySyncState", void 0);
//# sourceMappingURL=heartbeat.dto.js.map