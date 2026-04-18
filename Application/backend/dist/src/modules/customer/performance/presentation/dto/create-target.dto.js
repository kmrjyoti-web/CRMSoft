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
exports.CreateTargetDto = exports.TargetPeriod = exports.TargetMetric = void 0;
const class_validator_1 = require("class-validator");
var TargetMetric;
(function (TargetMetric) {
    TargetMetric["LEADS_CREATED"] = "LEADS_CREATED";
    TargetMetric["LEADS_WON"] = "LEADS_WON";
    TargetMetric["REVENUE"] = "REVENUE";
    TargetMetric["ACTIVITIES"] = "ACTIVITIES";
    TargetMetric["DEMOS"] = "DEMOS";
    TargetMetric["CALLS"] = "CALLS";
    TargetMetric["MEETINGS"] = "MEETINGS";
    TargetMetric["VISITS"] = "VISITS";
    TargetMetric["QUOTATIONS_SENT"] = "QUOTATIONS_SENT";
    TargetMetric["QUOTATIONS_ACCEPTED"] = "QUOTATIONS_ACCEPTED";
})(TargetMetric || (exports.TargetMetric = TargetMetric = {}));
var TargetPeriod;
(function (TargetPeriod) {
    TargetPeriod["DAILY"] = "DAILY";
    TargetPeriod["WEEKLY"] = "WEEKLY";
    TargetPeriod["MONTHLY"] = "MONTHLY";
    TargetPeriod["QUARTERLY"] = "QUARTERLY";
    TargetPeriod["YEARLY"] = "YEARLY";
})(TargetPeriod || (exports.TargetPeriod = TargetPeriod = {}));
class CreateTargetDto {
}
exports.CreateTargetDto = CreateTargetDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTargetDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TargetMetric),
    __metadata("design:type", String)
], CreateTargetDto.prototype, "metric", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTargetDto.prototype, "targetValue", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TargetPeriod),
    __metadata("design:type", String)
], CreateTargetDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTargetDto.prototype, "periodStart", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTargetDto.prototype, "periodEnd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTargetDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTargetDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTargetDto.prototype, "notes", void 0);
//# sourceMappingURL=create-target.dto.js.map