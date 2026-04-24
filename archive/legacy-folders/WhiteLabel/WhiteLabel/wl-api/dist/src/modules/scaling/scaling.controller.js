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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const scaling_service_1 = require("./scaling.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
class UpdatePolicyDto {
    maxInstances;
    minInstances;
    scaleUpThreshold;
    scaleDownThreshold;
    isAutoScalingEnabled;
    cooldownMinutes;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], UpdatePolicyDto.prototype, "maxInstances", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdatePolicyDto.prototype, "minInstances", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(95),
    __metadata("design:type", Number)
], UpdatePolicyDto.prototype, "scaleUpThreshold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], UpdatePolicyDto.prototype, "scaleDownThreshold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePolicyDto.prototype, "isAutoScalingEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], UpdatePolicyDto.prototype, "cooldownMinutes", void 0);
let ScalingController = class ScalingController {
    scalingService;
    constructor(scalingService) {
        this.scalingService = scalingService;
    }
    getDashboard() {
        return this.scalingService.getScalingDashboard();
    }
    getPolicy(partnerId) {
        return this.scalingService.getOrCreatePolicy(partnerId);
    }
    updatePolicy(partnerId, dto) {
        return this.scalingService.updatePolicy(partnerId, dto);
    }
    getHistory(partnerId, limit = '20') {
        return this.scalingService.getScalingHistory(partnerId, +limit);
    }
    evaluatePartner(partnerId) {
        return this.scalingService.evaluatePartner(partnerId);
    }
    evaluateAll() {
        return this.scalingService.evaluateAll().then(() => ({ triggered: true }));
    }
};
exports.ScalingController = ScalingController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScalingController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('policies/:partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScalingController.prototype, "getPolicy", null);
__decorate([
    (0, common_1.Put)('policies/:partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdatePolicyDto]),
    __metadata("design:returntype", void 0)
], ScalingController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.Get)('events/:partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ScalingController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('evaluate/:partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScalingController.prototype, "evaluatePartner", null);
__decorate([
    (0, common_1.Post)('evaluate-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScalingController.prototype, "evaluateAll", null);
exports.ScalingController = ScalingController = __decorate([
    (0, swagger_1.ApiTags)('scaling'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('scaling'),
    __metadata("design:paramtypes", [scaling_service_1.ScalingService])
], ScalingController);
//# sourceMappingURL=scaling.controller.js.map