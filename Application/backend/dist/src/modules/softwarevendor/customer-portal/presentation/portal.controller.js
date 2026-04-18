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
exports.PortalController = void 0;
const common_1 = require("@nestjs/common");
const customer_portal_service_1 = require("../customer-portal.service");
const api_response_1 = require("../../../../common/utils/api-response");
const customer_portal_dto_1 = require("./dto/customer-portal.dto");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../../common/decorators/roles.decorator");
let PortalController = class PortalController {
    constructor(service) {
        this.service = service;
    }
    async login(tenantId, dto) {
        const data = await this.service.login(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Login successful');
    }
    async forgotPassword(tenantId, dto) {
        const data = await this.service.requestPasswordReset(tenantId, dto);
        return api_response_1.ApiResponse.success(data);
    }
    async resetPassword(tenantId, dto) {
        const data = await this.service.resetPassword(tenantId, dto);
        return api_response_1.ApiResponse.success(data);
    }
    getRoutes() {
        return api_response_1.ApiResponse.success(customer_portal_service_1.PORTAL_DEFAULT_ROUTES);
    }
    async getMe(tenantId, userId) {
        const data = await this.service.getMe(tenantId, userId);
        return api_response_1.ApiResponse.success(data);
    }
    async updateMe(tenantId, userId, dto) {
        const data = await this.service.updateMe(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data);
    }
    async changeMyPassword(tenantId, userId, dto) {
        const data = await this.service.changeMyPassword(tenantId, userId, dto.currentPassword, dto.newPassword);
        return api_response_1.ApiResponse.success(data);
    }
};
exports.PortalController = PortalController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_portal_dto_1.CustomerPortalLoginDto]),
    __metadata("design:returntype", Promise)
], PortalController.prototype, "login", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_portal_dto_1.RequestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], PortalController.prototype, "forgotPassword", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_portal_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], PortalController.prototype, "resetPassword", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('routes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getRoutes", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PortalController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PortalController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)('me/change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PortalController.prototype, "changeMyPassword", null);
exports.PortalController = PortalController = __decorate([
    (0, common_1.Controller)('portal'),
    __metadata("design:paramtypes", [customer_portal_service_1.CustomerPortalService])
], PortalController);
//# sourceMappingURL=portal.controller.js.map