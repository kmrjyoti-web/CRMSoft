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
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("./security.service");
const create_incident_dto_1 = require("./dto/create-incident.dto");
let SecurityController = class SecurityController {
    constructor(securityService) {
        this.securityService = securityService;
    }
    getLatestSnapshots() {
        return this.securityService.getLatestSnapshots();
    }
    getSnapshots(service, page, limit) {
        return this.securityService.getSnapshots({
            service,
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }
    captureHealthSnapshot() {
        return this.securityService.captureHealthSnapshot();
    }
    getIncidents(status, severity, page, limit) {
        return this.securityService.getIncidents({
            status,
            severity,
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }
    createIncident(dto) {
        return this.securityService.createIncident(dto);
    }
    getIncident(id) {
        return this.securityService.getIncident(id);
    }
    updateIncident(id, body) {
        return this.securityService.updateIncident(id, body);
    }
    addPostmortem(id, body) {
        return this.securityService.addPostmortem(id, body.postmortem);
    }
    getDRPlans() {
        return this.securityService.getDRPlans();
    }
    getDRPlan(service) {
        return this.securityService.getDRPlan(service);
    }
    updateDRPlan(service, body) {
        return this.securityService.updateDRPlan(service, body);
    }
    testDRPlan(service) {
        return this.securityService.testDRPlan(service);
    }
    getNotificationStats() {
        return this.securityService.getNotificationStats();
    }
    getNotifications(page, limit) {
        return this.securityService.getNotifications({
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
        });
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)('snapshots/latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getLatestSnapshots", null);
__decorate([
    (0, common_1.Get)('snapshots'),
    __param(0, (0, common_1.Query)('service')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getSnapshots", null);
__decorate([
    (0, common_1.Post)('snapshots/capture'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "captureHealthSnapshot", null);
__decorate([
    (0, common_1.Get)('incidents'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('severity')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getIncidents", null);
__decorate([
    (0, common_1.Post)('incidents'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_incident_dto_1.CreateIncidentDto]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "createIncident", null);
__decorate([
    (0, common_1.Get)('incidents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getIncident", null);
__decorate([
    (0, common_1.Patch)('incidents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "updateIncident", null);
__decorate([
    (0, common_1.Post)('incidents/:id/postmortem'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "addPostmortem", null);
__decorate([
    (0, common_1.Get)('dr-plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getDRPlans", null);
__decorate([
    (0, common_1.Get)('dr-plans/:service'),
    __param(0, (0, common_1.Param)('service')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getDRPlan", null);
__decorate([
    (0, common_1.Patch)('dr-plans/:service'),
    __param(0, (0, common_1.Param)('service')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "updateDRPlan", null);
__decorate([
    (0, common_1.Post)('dr-plans/:service/test'),
    __param(0, (0, common_1.Param)('service')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "testDRPlan", null);
__decorate([
    (0, common_1.Get)('notifications/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getNotificationStats", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SecurityController.prototype, "getNotifications", null);
exports.SecurityController = SecurityController = __decorate([
    (0, common_1.Controller)('platform-console/security'),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map