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
exports.CreateScheduleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateScheduleDto {
}
exports.CreateScheduleDto = CreateScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Schedule display name',
        example: 'Weekly Sales Summary',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Report definition code',
        example: 'SALES_SUMMARY',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "reportCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Report generation frequency',
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Export file format',
        enum: ['PDF', 'EXCEL', 'CSV'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['PDF', 'EXCEL', 'CSV']),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Report filters as key-value pairs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateScheduleDto.prototype, "filters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recipient email addresses',
        example: ['sales@example.com', 'manager@example.com'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateScheduleDto.prototype, "recipientEmails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Day of week (0=Sun, 6=Sat) for weekly schedules',
        minimum: 0,
        maximum: 6,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Day of month (1-31) for monthly schedules',
        minimum: 1,
        maximum: 31,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(31),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "dayOfMonth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Time of day in HH:mm format',
        default: '08:00',
        example: '08:00',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "timeOfDay", void 0);
//# sourceMappingURL=create-schedule.dto.js.map