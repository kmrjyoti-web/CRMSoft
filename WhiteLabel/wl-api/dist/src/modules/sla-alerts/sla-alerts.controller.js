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
exports.SlaAlertsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sla_alerts_service_1 = require("./sla-alerts.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let SlaAlertsController = class SlaAlertsController {
    slaAlertsService;
    constructor(slaAlertsService) {
        this.slaAlertsService = slaAlertsService;
    }
    getDashboard() {
        return this.slaAlertsService.getDashboard();
    }
    getAlertHistory(page = '1', limit = '20', alertType) {
        return this.slaAlertsService.getAlertHistory({ page: +page, limit: +limit, alertType });
    }
    runBreachCheck() {
        return this.slaAlertsService.checkSlaBreaches().then(() => ({ triggered: true }));
    }
    runOverdueCheck() {
        return this.slaAlertsService.checkPaymentOverdue().then(() => ({ triggered: true }));
    }
};
exports.SlaAlertsController = SlaAlertsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlaAlertsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('alertType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], SlaAlertsController.prototype, "getAlertHistory", null);
__decorate([
    (0, common_1.Post)('run/breaches'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlaAlertsController.prototype, "runBreachCheck", null);
__decorate([
    (0, common_1.Post)('run/overdue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlaAlertsController.prototype, "runOverdueCheck", null);
exports.SlaAlertsController = SlaAlertsController = __decorate([
    (0, swagger_1.ApiTags)('sla-alerts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.Controller)('sla-alerts'),
    __metadata("design:paramtypes", [sla_alerts_service_1.SlaAlertsService])
], SlaAlertsController);
//# sourceMappingURL=sla-alerts.controller.js.map