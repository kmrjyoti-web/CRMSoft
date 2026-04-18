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
exports.SubscriptionPackageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const subscription_package_service_1 = require("../services/subscription-package.service");
const subscription_package_dto_1 = require("./dto/subscription-package.dto");
let SubscriptionPackageController = class SubscriptionPackageController {
    constructor(packageService) {
        this.packageService = packageService;
    }
    async listAll(query) {
        const packages = await this.packageService.listAll(query.activeOnly);
        return api_response_1.ApiResponse.success(packages);
    }
    async getFeatured() {
        const packages = await this.packageService.getFeatured();
        return api_response_1.ApiResponse.success(packages);
    }
    async getByCode(code) {
        const pkg = await this.packageService.getByCode(code);
        return api_response_1.ApiResponse.success(pkg);
    }
    async create(dto) {
        const pkg = await this.packageService.create(dto);
        return api_response_1.ApiResponse.success(pkg, 'Package created');
    }
    async update(id, dto) {
        const pkg = await this.packageService.update(id, dto);
        return api_response_1.ApiResponse.success(pkg, 'Package updated');
    }
    async deactivate(id) {
        const pkg = await this.packageService.deactivate(id);
        return api_response_1.ApiResponse.success(pkg, 'Package deactivated');
    }
};
exports.SubscriptionPackageController = SubscriptionPackageController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all subscription packages' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_package_dto_1.ListPackagesQueryDto]),
    __metadata("design:returntype", Promise)
], SubscriptionPackageController.prototype, "listAll", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'List featured active packages' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionPackageController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)(':code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get package detail by code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionPackageController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a subscription package (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_package_dto_1.CreateSubscriptionPackageDto]),
    __metadata("design:returntype", Promise)
], SubscriptionPackageController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subscription package (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, subscription_package_dto_1.UpdateSubscriptionPackageDto]),
    __metadata("design:returntype", Promise)
], SubscriptionPackageController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a subscription package (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionPackageController.prototype, "deactivate", null);
exports.SubscriptionPackageController = SubscriptionPackageController = __decorate([
    (0, swagger_1.ApiTags)('Subscription Packages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('subscription-packages'),
    __metadata("design:paramtypes", [subscription_package_service_1.SubscriptionPackageService])
], SubscriptionPackageController);
//# sourceMappingURL=subscription-package.controller.js.map