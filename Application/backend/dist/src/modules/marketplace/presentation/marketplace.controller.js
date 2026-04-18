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
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const marketplace_module_service_1 = require("../services/marketplace-module.service");
const marketplace_install_service_1 = require("../services/marketplace-install.service");
const review_service_1 = require("../services/review.service");
const marketplace_dto_1 = require("./dto/marketplace.dto");
let MarketplaceController = class MarketplaceController {
    constructor(moduleService, installService, reviewService) {
        this.moduleService = moduleService;
        this.installService = installService;
        this.reviewService = reviewService;
    }
    async listModules(query) {
        const result = await this.moduleService.listPublished(query);
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getFeatured() {
        const modules = await this.moduleService.getFeatured();
        return api_response_1.ApiResponse.success(modules, 'Featured modules');
    }
    async getModuleDetail(code) {
        const mod = await this.moduleService.getDetail(code);
        return api_response_1.ApiResponse.success(mod);
    }
    async installModule(moduleId, tenantId) {
        const installation = await this.installService.install(tenantId, moduleId);
        return api_response_1.ApiResponse.success(installation, 'Module installed (trial started)');
    }
    async activateModule(moduleId, tenantId, dto) {
        const installation = await this.installService.activate(tenantId, moduleId, dto.subscriptionId, dto.planId);
        return api_response_1.ApiResponse.success(installation, 'Module activated');
    }
    async cancelModule(moduleId, tenantId) {
        const result = await this.installService.cancel(tenantId, moduleId);
        return api_response_1.ApiResponse.success(result, 'Module cancelled');
    }
    async listInstalled(tenantId) {
        const installations = await this.installService.listInstalled(tenantId);
        return api_response_1.ApiResponse.success(installations);
    }
    async submitReview(moduleId, tenantId, dto) {
        const review = await this.reviewService.create(tenantId, moduleId, dto);
        return api_response_1.ApiResponse.success(review, 'Review submitted');
    }
    async listReviews(moduleId, query) {
        const page = +(query.page || '1');
        const limit = +(query.limit || '10');
        const result = await this.reviewService.listForModule(moduleId, page, limit);
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, common_1.Get)('modules'),
    (0, swagger_1.ApiOperation)({ summary: 'List published marketplace modules' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marketplace_dto_1.ListModulesQueryDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listModules", null);
__decorate([
    (0, common_1.Get)('modules/featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured marketplace modules' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)('modules/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get module detail by code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getModuleDetail", null);
__decorate([
    (0, common_1.Post)('modules/:id/install'),
    (0, swagger_1.ApiOperation)({ summary: 'Install a module (start trial)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "installModule", null);
__decorate([
    (0, common_1.Post)('modules/:id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate module subscription' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, marketplace_dto_1.ActivateModuleDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "activateModule", null);
__decorate([
    (0, common_1.Delete)('modules/:id/install'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel/uninstall a module' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "cancelModule", null);
__decorate([
    (0, common_1.Get)('installed'),
    (0, swagger_1.ApiOperation)({ summary: 'List tenant installed modules' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listInstalled", null);
__decorate([
    (0, common_1.Post)('modules/:id/reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a review for a module' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, marketplace_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "submitReview", null);
__decorate([
    (0, common_1.Get)('modules/:id/reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'List reviews for a module' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, marketplace_dto_1.ListReviewsQueryDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listReviews", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace'),
    __metadata("design:paramtypes", [marketplace_module_service_1.MarketplaceModuleService,
        marketplace_install_service_1.MarketplaceInstallService,
        review_service_1.ReviewService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map