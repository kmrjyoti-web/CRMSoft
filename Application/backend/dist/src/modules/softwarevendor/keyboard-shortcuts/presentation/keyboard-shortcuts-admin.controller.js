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
exports.KeyboardShortcutsAdminController = void 0;
const common_1 = require("@nestjs/common");
const keyboard_shortcuts_service_1 = require("../services/keyboard-shortcuts.service");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const shortcut_dto_1 = require("./dto/shortcut.dto");
let KeyboardShortcutsAdminController = class KeyboardShortcutsAdminController {
    constructor(service) {
        this.service = service;
    }
    async listAll(user) {
        const result = await this.service.adminListDefinitions(user.tenantId ?? '');
        return api_response_1.ApiResponse.success(result);
    }
    async seed(user) {
        const result = await this.service.seedDefaults(user.tenantId ?? '');
        return api_response_1.ApiResponse.success(result, `Seeded ${result.seeded} shortcuts`);
    }
    async lock(id) {
        const result = await this.service.lockShortcut(id);
        return api_response_1.ApiResponse.success(result, 'Shortcut locked');
    }
    async unlock(id) {
        const result = await this.service.unlockShortcut(id);
        return api_response_1.ApiResponse.success(result, 'Shortcut unlocked');
    }
    async update(id, dto) {
        const result = await this.service.updateDefinition(id, dto);
        return api_response_1.ApiResponse.success(result, 'Shortcut updated');
    }
};
exports.KeyboardShortcutsAdminController = KeyboardShortcutsAdminController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsAdminController.prototype, "listAll", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsAdminController.prototype, "seed", null);
__decorate([
    (0, common_1.Put)(':id/lock'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsAdminController.prototype, "lock", null);
__decorate([
    (0, common_1.Put)(':id/unlock'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsAdminController.prototype, "unlock", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings:manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shortcut_dto_1.UpdateDefinitionDto]),
    __metadata("design:returntype", Promise)
], KeyboardShortcutsAdminController.prototype, "update", null);
exports.KeyboardShortcutsAdminController = KeyboardShortcutsAdminController = __decorate([
    (0, common_1.Controller)('keyboard-shortcuts/admin'),
    __metadata("design:paramtypes", [keyboard_shortcuts_service_1.KeyboardShortcutsService])
], KeyboardShortcutsAdminController);
//# sourceMappingURL=keyboard-shortcuts-admin.controller.js.map