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
exports.NotificationPrefController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_pref_service_1 = require("../services/notification-pref.service");
const update_notif_pref_dto_1 = require("./dto/update-notif-pref.dto");
let NotificationPrefController = class NotificationPrefController {
    constructor(service) {
        this.service = service;
    }
    getAll(req) {
        return this.service.getAllGrouped(req.user.tenantId);
    }
    update(req, eventCode, dto) {
        return this.service.update(req.user.tenantId, eventCode, dto);
    }
    bulkUpdate(req, dto) {
        const updates = dto.updates.map((u) => ({
            eventCode: u.eventCode,
            changes: u,
        }));
        return this.service.bulkUpdate(req.user.tenantId, updates);
    }
    sendTest(req, eventCode) {
        return this.service.sendTest(req.user.tenantId, eventCode);
    }
};
exports.NotificationPrefController = NotificationPrefController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationPrefController.prototype, "getAll", null);
__decorate([
    (0, common_1.Put)(':eventCode'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('eventCode')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_notif_pref_dto_1.UpdateNotifPrefDto]),
    __metadata("design:returntype", void 0)
], NotificationPrefController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('bulk'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_notif_pref_dto_1.BulkUpdateNotifPrefDto]),
    __metadata("design:returntype", void 0)
], NotificationPrefController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Post)('test/:eventCode'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('eventCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NotificationPrefController.prototype, "sendTest", null);
exports.NotificationPrefController = NotificationPrefController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Notification Preferences'),
    (0, common_1.Controller)('settings/notifications'),
    __metadata("design:paramtypes", [notification_pref_service_1.NotificationPrefService])
], NotificationPrefController);
//# sourceMappingURL=notification-pref.controller.js.map