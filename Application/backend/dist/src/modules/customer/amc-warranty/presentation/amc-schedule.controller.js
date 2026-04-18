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
exports.AMCScheduleController = void 0;
const common_1 = require("@nestjs/common");
const amc_schedule_service_1 = require("../services/amc-schedule.service");
let AMCScheduleController = class AMCScheduleController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(req, q) {
        return this.svc.findAll(req.user.tenantId, {
            from: q.from ? new Date(q.from) : undefined,
            to: q.to ? new Date(q.to) : undefined,
            status: q.status,
        });
    }
    complete(req, id, dto) {
        return this.svc.complete(req.user.tenantId, id, dto);
    }
    reschedule(req, id, dto) {
        return this.svc.reschedule(req.user.tenantId, id, new Date(dto.newDate));
    }
};
exports.AMCScheduleController = AMCScheduleController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AMCScheduleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AMCScheduleController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/reschedule'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AMCScheduleController.prototype, "reschedule", null);
exports.AMCScheduleController = AMCScheduleController = __decorate([
    (0, common_1.Controller)('amc/schedules'),
    __metadata("design:paramtypes", [amc_schedule_service_1.AMCScheduleService])
], AMCScheduleController);
//# sourceMappingURL=amc-schedule.controller.js.map