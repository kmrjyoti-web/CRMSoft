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
exports.GoogleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../common/utils/api-response");
const google_service_1 = require("./google.service");
let GoogleController = class GoogleController {
    constructor(googleService) {
        this.googleService = googleService;
    }
    async initiateAuth(body, userId, tenantId) {
        const authUrl = await this.googleService.getAuthUrl(tenantId, userId, body.services);
        return api_response_1.ApiResponse.success({ authUrl }, 'Google auth URL generated');
    }
    async handleCallback(body, userId, tenantId) {
        const result = await this.googleService.handleCallback(tenantId, userId, body.code, body.services);
        return api_response_1.ApiResponse.success(result, 'Google account connected');
    }
    async getStatus(userId, tenantId) {
        const status = await this.googleService.getStatus(tenantId, userId);
        return api_response_1.ApiResponse.success(status, 'Connection status retrieved');
    }
    async disconnect(userId, tenantId) {
        const result = await this.googleService.disconnect(tenantId, userId);
        return api_response_1.ApiResponse.success(result, 'Google account disconnected');
    }
    async syncService(service, userId, tenantId) {
        const result = await this.googleService.syncService(tenantId, userId, service);
        return api_response_1.ApiResponse.success(result, `${service} sync completed`);
    }
    async getCalendarSettings(userId, tenantId) {
        const settings = await this.googleService.getCalendarSettings(tenantId, userId);
        return api_response_1.ApiResponse.success(settings, 'Calendar settings retrieved');
    }
    async updateCalendarSettings(body, userId, tenantId) {
        const settings = await this.googleService.updateCalendarSettings(tenantId, userId, body);
        return api_response_1.ApiResponse.success(settings, 'Calendar settings updated');
    }
    async getContactsSettings(userId, tenantId) {
        const settings = await this.googleService.getContactsSettings(tenantId, userId);
        return api_response_1.ApiResponse.success(settings, 'Contacts settings retrieved');
    }
    async updateContactsSettings(body, userId, tenantId) {
        const settings = await this.googleService.updateContactsSettings(tenantId, userId, body);
        return api_response_1.ApiResponse.success(settings, 'Contacts settings updated');
    }
};
exports.GoogleController = GoogleController;
__decorate([
    (0, common_1.Post)('auth/initiate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "initiateAuth", null);
__decorate([
    (0, common_1.Post)('auth/callback'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "handleCallback", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('disconnect'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Post)('sync/:service'),
    __param(0, (0, common_1.Param)('service')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "syncService", null);
__decorate([
    (0, common_1.Get)('settings/calendar'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "getCalendarSettings", null);
__decorate([
    (0, common_1.Put)('settings/calendar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "updateCalendarSettings", null);
__decorate([
    (0, common_1.Get)('settings/contacts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "getContactsSettings", null);
__decorate([
    (0, common_1.Put)('settings/contacts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GoogleController.prototype, "updateContactsSettings", null);
exports.GoogleController = GoogleController = __decorate([
    (0, swagger_1.ApiTags)('Google'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('google'),
    __metadata("design:paramtypes", [google_service_1.GoogleService])
], GoogleController);
//# sourceMappingURL=google.controller.js.map