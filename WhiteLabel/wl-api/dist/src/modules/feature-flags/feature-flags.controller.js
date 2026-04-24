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
exports.FeatureFlagsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const feature_flags_service_1 = require("./feature-flags.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ToggleFeatureDto {
    isEnabled;
    config;
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleFeatureDto.prototype, "isEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ToggleFeatureDto.prototype, "config", void 0);
class BulkFeatureItem {
    featureCode;
    isEnabled;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkFeatureItem.prototype, "featureCode", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkFeatureItem.prototype, "isEnabled", void 0);
class BulkSetDto {
    features;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkFeatureItem),
    __metadata("design:type", Array)
], BulkSetDto.prototype, "features", void 0);
let FeatureFlagsController = class FeatureFlagsController {
    featureFlagsService;
    constructor(featureFlagsService) {
        this.featureFlagsService = featureFlagsService;
    }
    getAvailableFeatures() {
        return this.featureFlagsService.getAvailableFeatures();
    }
    getDashboard() {
        return this.featureFlagsService.getDashboard();
    }
    getByPartner(partnerId) {
        return this.featureFlagsService.getByPartner(partnerId);
    }
    getEnabled(partnerId) {
        return this.featureFlagsService.getEnabled(partnerId);
    }
    toggle(partnerId, featureCode, dto) {
        return this.featureFlagsService.toggle(partnerId, featureCode, dto.isEnabled, dto.config);
    }
    bulkSet(partnerId, dto) {
        return this.featureFlagsService.bulkSet(partnerId, dto.features);
    }
    enableAll(partnerId) {
        return this.featureFlagsService.enableAll(partnerId);
    }
    disableAll(partnerId) {
        return this.featureFlagsService.disableAll(partnerId);
    }
};
exports.FeatureFlagsController = FeatureFlagsController;
__decorate([
    (0, common_1.Get)('available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "getAvailableFeatures", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('partner/:partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "getByPartner", null);
__decorate([
    (0, common_1.Get)('partner/:partnerId/enabled'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "getEnabled", null);
__decorate([
    (0, common_1.Patch)('partner/:partnerId/:featureCode'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Param)('featureCode')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ToggleFeatureDto]),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "toggle", null);
__decorate([
    (0, common_1.Post)('partner/:partnerId/bulk'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, BulkSetDto]),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "bulkSet", null);
__decorate([
    (0, common_1.Post)('partner/:partnerId/enable-all'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "enableAll", null);
__decorate([
    (0, common_1.Post)('partner/:partnerId/disable-all'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeatureFlagsController.prototype, "disableAll", null);
exports.FeatureFlagsController = FeatureFlagsController = __decorate([
    (0, swagger_1.ApiTags)('feature-flags'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('feature-flags'),
    __metadata("design:paramtypes", [feature_flags_service_1.FeatureFlagsService])
], FeatureFlagsController);
//# sourceMappingURL=feature-flags.controller.js.map