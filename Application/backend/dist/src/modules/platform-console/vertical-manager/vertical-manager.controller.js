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
exports.VerticalManagerController = void 0;
const common_1 = require("@nestjs/common");
const vertical_manager_service_1 = require("./vertical-manager.service");
const register_vertical_dto_1 = require("./dto/register-vertical.dto");
let VerticalManagerController = class VerticalManagerController {
    constructor(verticalManagerService) {
        this.verticalManagerService = verticalManagerService;
    }
    getHealthOverview() {
        return this.verticalManagerService.getHealthOverview();
    }
    getVerticals() {
        return this.verticalManagerService.getVerticals();
    }
    registerVertical(dto) {
        return this.verticalManagerService.registerVertical(dto);
    }
    getVerticalDetail(code) {
        return this.verticalManagerService.getVerticalDetail(code);
    }
    updateVertical(code, data) {
        return this.verticalManagerService.updateVertical(code, data);
    }
    updateVerticalStatus(code, body) {
        return this.verticalManagerService.updateVerticalStatus(code, body.status);
    }
    getVerticalHealth(code) {
        return this.verticalManagerService.getVerticalHealth(code);
    }
    runVerticalAudit(code) {
        return this.verticalManagerService.runVerticalAudit(code);
    }
    getAudits(code, page, limit) {
        return this.verticalManagerService.getAudits(code, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    getAuditDetail(code, id) {
        return this.verticalManagerService.getAuditDetail(code, id);
    }
};
exports.VerticalManagerController = VerticalManagerController;
__decorate([
    (0, common_1.Get)('health/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "getHealthOverview", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "getVerticals", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_vertical_dto_1.RegisterVerticalDto]),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "registerVertical", null);
__decorate([
    (0, common_1.Get)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "getVerticalDetail", null);
__decorate([
    (0, common_1.Patch)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "updateVertical", null);
__decorate([
    (0, common_1.Patch)(':code/status'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "updateVerticalStatus", null);
__decorate([
    (0, common_1.Get)(':code/health'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "getVerticalHealth", null);
__decorate([
    (0, common_1.Post)(':code/audit'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "runVerticalAudit", null);
__decorate([
    (0, common_1.Get)(':code/audits'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "getAudits", null);
__decorate([
    (0, common_1.Get)(':code/audits/:id'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VerticalManagerController.prototype, "getAuditDetail", null);
exports.VerticalManagerController = VerticalManagerController = __decorate([
    (0, common_1.Controller)('platform-console/verticals'),
    __metadata("design:paramtypes", [vertical_manager_service_1.VerticalManagerService])
], VerticalManagerController);
//# sourceMappingURL=vertical-manager.controller.js.map