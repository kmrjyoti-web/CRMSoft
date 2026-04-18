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
exports.CalendarSyncController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const calendar_sync_service_1 = require("../calendar-sync.service");
let CalendarSyncController = class CalendarSyncController {
    constructor(syncService) {
        this.syncService = syncService;
    }
    async connect(userId, tenantId, body) {
        const result = await this.syncService.connectProvider(userId, tenantId, body.provider, body.accessToken, body.refreshToken, new Date(body.expiresAt), body.calendarId, body.externalEmail);
        return api_response_1.ApiResponse.success(result, 'Calendar provider connected');
    }
    async disconnect(userId, tenantId, provider) {
        await this.syncService.disconnectProvider(userId, tenantId, provider);
        return api_response_1.ApiResponse.success(null, 'Calendar provider disconnected');
    }
    async triggerSync(userId, tenantId, provider) {
        const result = await this.syncService.triggerSync(userId, tenantId, provider);
        return api_response_1.ApiResponse.success(result, 'Sync triggered');
    }
    async getSyncStatus(userId, tenantId) {
        const syncs = await this.syncService.getSyncStatus(userId, tenantId);
        return api_response_1.ApiResponse.success(syncs);
    }
    async webhook(provider, payload) {
        await this.syncService.handleWebhook(provider, payload);
        return api_response_1.ApiResponse.success(null, 'Webhook received');
    }
};
exports.CalendarSyncController = CalendarSyncController;
__decorate([
    (0, common_1.Post)('connect'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:sync'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CalendarSyncController.prototype, "connect", null);
__decorate([
    (0, common_1.Delete)(':provider'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarSyncController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Post)(':provider/trigger'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:sync'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarSyncController.prototype, "triggerSync", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarSyncController.prototype, "getSyncStatus", null);
__decorate([
    (0, common_1.Post)('webhook/:provider'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CalendarSyncController.prototype, "webhook", null);
exports.CalendarSyncController = CalendarSyncController = __decorate([
    (0, common_1.Controller)('calendar/sync'),
    __metadata("design:paramtypes", [calendar_sync_service_1.CalendarSyncService])
], CalendarSyncController);
//# sourceMappingURL=calendar-sync.controller.js.map