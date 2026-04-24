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
const swagger_1 = require("@nestjs/swagger");
const branding_service_1 = require("./branding.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let BrandingController = class BrandingController {
    brandingService;
    constructor(brandingService) {
        this.brandingService = brandingService;
    }
    create(dto) { return this.brandingService.create(dto); }
    getByDomain(domain) { return this.brandingService.getByDomain(domain); }
    getByPartner(partnerId) { return this.brandingService.getByPartner(partnerId); }
    update(partnerId, dto) { return this.brandingService.update(partnerId, dto); }
};
exports.BrandingController = BrandingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('by-domain/:domain'),
    __param(0, (0, common_1.Param)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "getByDomain", null);
__decorate([
    (0, common_1.Get)(':partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "getByPartner", null);
__decorate([
    (0, common_1.Patch)(':partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BrandingController.prototype, "update", null);
exports.BrandingController = BrandingController = __decorate([
    (0, swagger_1.ApiTags)('branding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('branding'),
    __metadata("design:paramtypes", [branding_service_1.BrandingService])
], BrandingController);
//# sourceMappingURL=branding.controller.js.map