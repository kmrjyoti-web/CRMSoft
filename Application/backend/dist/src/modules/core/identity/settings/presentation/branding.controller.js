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
exports.BrandingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const branding_service_1 = require("../services/branding.service");
const domain_verifier_service_1 = require("../services/domain-verifier.service");
const update_branding_dto_1 = require("./dto/update-branding.dto");
let BrandingController = class BrandingController {
    constructor(brandingService, domainVerifier) {
        this.brandingService = brandingService;
        this.domainVerifier = domainVerifier;
    }
    get(req) {
        return this.brandingService.get(req.user.tenantId);
    }
    update(req, dto) {
        return this.brandingService.update(req.user.tenantId, dto);
    }
    uploadLogo(req, type, file) {
        return this.brandingService.uploadLogo(req.user.tenantId, file, type);
    }
    initiateDomain(req, dto) {
        return this.domainVerifier.initiate(req.user.tenantId, dto.domain);
    }
    verifyDomain(req) {
        return this.domainVerifier.verify(req.user.tenantId);
    }
    reset(req) {
        return this.brandingService.resetToDefaults(req.user.tenantId);
    }
    getCssVariables(req) {
        return this.brandingService.getCssVariables(req.user.tenantId);
    }
};
exports.BrandingController = BrandingController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_branding_dto_1.UpdateBrandingDto]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('upload/:type'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 2 * 1024 * 1024 } })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Post)('domain/verify'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_branding_dto_1.InitiateDomainDto]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "initiateDomain", null);
__decorate([
    (0, common_1.Get)('domain/status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "verifyDomain", null);
__decorate([
    (0, common_1.Post)('reset'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "reset", null);
__decorate([
    (0, common_1.Get)('css-variables'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "getCssVariables", null);
exports.BrandingController = BrandingController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Branding'),
    (0, common_1.Controller)('settings/branding'),
    __metadata("design:paramtypes", [branding_service_1.BrandingService,
        domain_verifier_service_1.DomainVerifierService])
], BrandingController);
//# sourceMappingURL=branding.controller.js.map