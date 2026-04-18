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
exports.ReligiousModeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const religious_mode_service_1 = require("../services/religious-mode.service");
let ReligiousModeController = class ReligiousModeController {
    constructor(service) {
        this.service = service;
    }
    async getConfig(req) {
        return this.service.getConfig(req.user.tenantId);
    }
    async updateConfig(req, body) {
        return this.service.updateConfig(req.user.tenantId, body);
    }
    async getStatus(req) {
        return this.service.getStatus(req.user.tenantId, req.user.id, req.user.roleId, req.user.role);
    }
    getPresets() {
        return this.service.getPresets();
    }
    async logInteraction(req, body) {
        await this.service.logInteraction(req.user.tenantId, req.user.id, body.itemsOffered ?? [], body.duration ?? 0, body.date ?? new Date().toISOString().split('T')[0]);
        return { logged: true };
    }
    async getAnalytics(req) {
        return this.service.getAnalytics(req.user.tenantId);
    }
};
exports.ReligiousModeController = ReligiousModeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReligiousModeController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReligiousModeController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReligiousModeController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('presets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReligiousModeController.prototype, "getPresets", null);
__decorate([
    (0, common_1.Post)('log'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReligiousModeController.prototype, "logInteraction", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReligiousModeController.prototype, "getAnalytics", null);
exports.ReligiousModeController = ReligiousModeController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Religious Mode'),
    (0, common_1.Controller)('settings/religious-mode'),
    __metadata("design:paramtypes", [religious_mode_service_1.ReligiousModeService])
], ReligiousModeController);
//# sourceMappingURL=religious-mode.controller.js.map