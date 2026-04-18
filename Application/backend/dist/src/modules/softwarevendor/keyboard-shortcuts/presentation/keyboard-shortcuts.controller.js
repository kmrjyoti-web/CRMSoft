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
exports.KeyboardShortcutsController = void 0;
const common_1 = require("@nestjs/common");
const keyboard_shortcuts_service_1 = require("../services/keyboard-shortcuts.service");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const shortcut_dto_1 = require("./dto/shortcut.dto");
let KeyboardShortcutsController = class KeyboardShortcutsController {
    constructor(service) {
        this.service = service;
    }
    async getAll(user) {
        const result = await this.service.getAllForUser(user.id, user.tenantId ?? '');
        return api_response_1.ApiResponse.success(result);
    }
    async upsertOverride(user, shortcutId, dto) {
        const result = await this.service.upsertOverride(user.id, user.tenantId ?? '', shortcutId, dto);
        return api_response_1.ApiResponse.success(result, 'Shortcut updated');
    }
    async removeOverride(user, shortcutId) {
        const result = await this.service.removeOverride(user.id, user.tenantId ?? '', shortcutId);
        return api_response_1.ApiResponse.success(result, 'Shortcut reset to default');
    }
    async resetAll(user) {
        const result = await this.service.resetAllOverrides(user.id, user.tenantId ?? '');
        return api_response_1.ApiResponse.success(result, 'All shortcuts reset to defaults');
    }
    async createCustom(user, dto) {
        const result = await this.service.createCustom(user.id, user.tenantId ?? '', dto);
        return api_response_1.ApiResponse.success(result, 'Custom shortcut created');
    }
    async checkConflict(user, dto) {
        const result = await this.service.checkConflict(user.id, user.tenantId ?? '', dto.key, dto.excludeShortcutId);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.KeyboardShortcutsController = KeyboardShortcutsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Put)(':shortcutId/override'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('shortcutId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, shortcut_dto_1.UpsertOverrideDto]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsController.prototype, "upsertOverride", null);
__decorate([
    (0, common_1.Delete)(':shortcutId/override'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('shortcutId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsController.prototype, "removeOverride", null);
__decorate([
    (0, common_1.Delete)('overrides/all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsController.prototype, "resetAll", null);
__decorate([
    (0, common_1.Post)('custom'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shortcut_dto_1.CreateCustomShortcutDto]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsController.prototype, "createCustom", null);
__decorate([
    (0, common_1.Post)('check-conflict'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shortcut_dto_1.CheckConflictDto]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsController.prototype, "checkConflict", null);
exports.KeyboardShortcutsController = KeyboardShortcutsController = __decorate([
    (0, common_1.Controller)('keyboard-shortcuts'),
    __metadata("design:paramtypes", [keyboard_shortcuts_service_1.KeyboardShortcutsService])
], KeyboardShortcutsController);
//# sourceMappingURL=keyboard-shortcuts.controller.js.map