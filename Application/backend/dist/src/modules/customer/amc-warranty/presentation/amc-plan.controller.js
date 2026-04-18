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
exports.AMCPlanController = void 0;
const common_1 = require("@nestjs/common");
const amc_plan_service_1 = require("../services/amc-plan.service");
let AMCPlanController = class AMCPlanController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(req, q) {
        return this.svc.findAll(req.user.tenantId, q);
    }
    findOne(id) {
        return this.svc.findById(id);
    }
    create(req, dto) {
        return this.svc.create(req.user.tenantId, dto);
    }
    update(req, id, dto) {
        return this.svc.update(req.user.tenantId, id, dto);
    }
    importPlan(req, id) {
        return this.svc.importSystemPlan(req.user.tenantId, id);
    }
};
exports.AMCPlanController = AMCPlanController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AMCPlanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AMCPlanController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AMCPlanController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AMCPlanController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/import'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AMCPlanController.prototype, "importPlan", null);
exports.AMCPlanController = AMCPlanController = __decorate([
    (0, common_1.Controller)('amc/plans'),
    __metadata("design:paramtypes", [amc_plan_service_1.AMCPlanService])
], AMCPlanController);
//# sourceMappingURL=amc-plan.controller.js.map