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
exports.BrandManagerController = void 0;
const common_1 = require("@nestjs/common");
const brand_manager_service_1 = require("./brand-manager.service");
const whitelist_module_dto_1 = require("./dto/whitelist-module.dto");
const set_feature_flag_dto_1 = require("./dto/set-feature-flag.dto");
let BrandManagerController = class BrandManagerController {
    constructor(brandManagerService) {
        this.brandManagerService = brandManagerService;
    }
    getErrorOverview() {
        return this.brandManagerService.getErrorOverview();
    }
    getBrands() {
        return this.brandManagerService.getBrands();
    }
    getBrandDetail(brandId) {
        return this.brandManagerService.getBrandDetail(brandId);
    }
    getModules(brandId) {
        return this.brandManagerService.getModules(brandId);
    }
    whitelistModule(brandId, dto) {
        return this.brandManagerService.whitelistModule(brandId, dto);
    }
    updateModule(id, body) {
        return this.brandManagerService.updateModule(id, body);
    }
    removeModule(id) {
        return this.brandManagerService.removeModule(id);
    }
    getFeatures(brandId) {
        return this.brandManagerService.getFeatures(brandId);
    }
    setFeatureFlag(brandId, dto) {
        return this.brandManagerService.setFeatureFlag(brandId, dto);
    }
    updateFeatureFlag(id, body) {
        return this.brandManagerService.updateFeatureFlag(id, body);
    }
    removeFeatureFlag(id) {
        return this.brandManagerService.removeFeatureFlag(id);
    }
    getBrandErrors(brandId) {
        return this.brandManagerService.getBrandErrors(brandId);
    }
};
exports.BrandManagerController = BrandManagerController;
__decorate([
    (0, common_1.Get)('errors/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "getErrorOverview", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "getBrands", null);
__decorate([
    (0, common_1.Get)(':brandId'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "getBrandDetail", null);
__decorate([
    (0, common_1.Get)(':brandId/modules'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "getModules", null);
__decorate([
    (0, common_1.Post)(':brandId/modules'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, whitelist_module_dto_1.WhitelistModuleDto]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "whitelistModule", null);
__decorate([
    (0, common_1.Patch)(':brandId/modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "updateModule", null);
__decorate([
    (0, common_1.Delete)(':brandId/modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "removeModule", null);
__decorate([
    (0, common_1.Get)(':brandId/features'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "getFeatures", null);
__decorate([
    (0, common_1.Post)(':brandId/features'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_feature_flag_dto_1.SetFeatureFlagDto]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "setFeatureFlag", null);
__decorate([
    (0, common_1.Patch)(':brandId/features/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "updateFeatureFlag", null);
__decorate([
    (0, common_1.Delete)(':brandId/features/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "removeFeatureFlag", null);
__decorate([
    (0, common_1.Get)(':brandId/errors'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrandManagerController.prototype, "getBrandErrors", null);
exports.BrandManagerController = BrandManagerController = __decorate([
    (0, common_1.Controller)('platform-console/brands'),
    __metadata("design:paramtypes", [brand_manager_service_1.BrandManagerService])
], BrandManagerController);
//# sourceMappingURL=brand-manager.controller.js.map