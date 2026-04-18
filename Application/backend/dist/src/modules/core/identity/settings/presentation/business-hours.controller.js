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
exports.BusinessHoursController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const working_client_1 = require("@prisma/working-client");
const business_hours_service_1 = require("../services/business-hours.service");
const update_business_hours_dto_1 = require("./dto/update-business-hours.dto");
let BusinessHoursController = class BusinessHoursController {
    constructor(service) {
        this.service = service;
    }
    getWeek(req) {
        return this.service.getWeekSchedule(req.user.tenantId);
    }
    updateWeek(req, dto) {
        return this.service.updateWeek(req.user.tenantId, dto.schedules);
    }
    updateDay(req, day, dto) {
        return this.service.updateDay(req.user.tenantId, day, dto);
    }
    isWorkingNow(req) {
        return this.service.isWorkingNow(req.user.tenantId).then((working) => ({ working }));
    }
};
exports.BusinessHoursController = BusinessHoursController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessHoursController.prototype, "getWeek", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_business_hours_dto_1.UpdateWeekScheduleDto]),
    __metadata("design:returntype", void 0)
], BusinessHoursController.prototype, "updateWeek", null);
__decorate([
    (0, common_1.Put)(':day'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('day')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_business_hours_dto_1.UpdateBusinessHoursDto]),
    __metadata("design:returntype", void 0)
], BusinessHoursController.prototype, "updateDay", null);
__decorate([
    (0, common_1.Get)('is-working-now'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessHoursController.prototype, "isWorkingNow", null);
exports.BusinessHoursController = BusinessHoursController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Business Hours'),
    (0, common_1.Controller)('settings/business-hours'),
    __metadata("design:paramtypes", [business_hours_service_1.BusinessHoursService])
], BusinessHoursController);
//# sourceMappingURL=business-hours.controller.js.map