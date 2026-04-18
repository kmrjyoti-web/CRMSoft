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
exports.UpsertPlanLimitsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PlanLimitItemDto {
    constructor() {
        this.limitValue = 0;
        this.isChargeable = false;
        this.chargeTokens = 0;
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanLimitItemDto.prototype, "resourceKey", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['TOTAL', 'MONTHLY', 'UNLIMITED', 'DISABLED']),
    __metadata("design:type", String)
], PlanLimitItemDto.prototype, "limitType", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PlanLimitItemDto.prototype, "limitValue", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PlanLimitItemDto.prototype, "isChargeable", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PlanLimitItemDto.prototype, "chargeTokens", void 0);
class UpsertPlanLimitsDto {
}
exports.UpsertPlanLimitsDto = UpsertPlanLimitsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlanLimitItemDto),
    __metadata("design:type", Array)
], UpsertPlanLimitsDto.prototype, "limits", void 0);
//# sourceMappingURL=upsert-plan-limits.dto.js.map