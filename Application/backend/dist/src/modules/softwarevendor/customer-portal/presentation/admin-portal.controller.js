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
exports.AdminPortalController = void 0;
const common_1 = require("@nestjs/common");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const customer_portal_service_1 = require("../customer-portal.service");
const customer_portal_dto_1 = require("./dto/customer-portal.dto");
let AdminPortalController = class AdminPortalController {
    constructor(service) {
        this.service = service;
    }
    async getEligible(tenantId) {
        const data = await this.service.getEligibleEntities(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async listUsers(tenantId) {
        const data = await this.service.listPortalUsers(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async getUser(tenantId, id) {
        const data = await this.service.getPortalUser(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async activate(tenantId, userId, dto) {
        const data = await this.service.activatePortal(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Portal activated successfully');
    }
    async updateUser(tenantId, id, body) {
        const data = await this.service.updatePortalUser(tenantId, id, body);
        return api_response_1.ApiResponse.success(data);
    }
    async updatePageOverrides(tenantId, id, dto) {
        const data = await this.service.updatePageOverrides(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Page overrides saved');
    }
    async resetPassword(tenantId, id) {
        const data = await this.service.resetUserPassword(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Temporary password generated');
    }
    async deactivate(tenantId, id) {
        const data = await this.service.deactivatePortalUser(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Portal user deactivated');
    }
    async listCategories(tenantId) {
        const data = await this.service.listCategories(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async createCategory(tenantId, userId, dto) {
        const data = await this.service.createCategory(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Menu category created');
    }
    async updateCategory(tenantId, id, dto) {
        const data = await this.service.updateCategory(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Menu category updated');
    }
    async deleteCategory(tenantId, id) {
        const data = await this.service.deleteCategory(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Menu category deleted');
    }
    async getAnalytics(tenantId) {
        const data = await this.service.getAnalytics(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async seedDefaults(tenantId, userId) {
        const data = await this.service.seedDefaultCategories(tenantId, userId);
        return api_response_1.ApiResponse.success(data, 'Default categories seeded');
    }
    getAvailableRoutes() {
        return api_response_1.ApiResponse.success(customer_portal_service_1.PORTAL_DEFAULT_ROUTES);
    }
};
exports.AdminPortalController = AdminPortalController;
__decorate([
    (0, common_1.Get)('eligible'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "getEligible", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, customer_portal_dto_1.ActivatePortalDto]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/page-overrides'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, customer_portal_dto_1.UpdatePageOverridesDto]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "updatePageOverrides", null);
__decorate([
    (0, common_1.Post)('users/:id/reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Get)('menu-categories'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "listCategories", null);
__decorate([
    (0, common_1.Post)('menu-categories'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, customer_portal_dto_1.CreateMenuCategoryDto]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('menu-categories/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, customer_portal_dto_1.UpdateMenuCategoryDto]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('menu-categories/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Post)('seed-defaults'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminPortalController.prototype, "seedDefaults", null);
__decorate([
    (0, common_1.Get)('available-routes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPortalController.prototype, "getAvailableRoutes", null);
exports.AdminPortalController = AdminPortalController = __decorate([
    (0, common_1.Controller)('admin/customer-portal'),
    (0, require_permissions_decorator_1.RequirePermissions)('customer_portal:manage'),
    __metadata("design:paramtypes", [customer_portal_service_1.CustomerPortalService])
], AdminPortalController);
//# sourceMappingURL=admin-portal.controller.js.map