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
exports.HolidayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const holiday_service_1 = require("../services/holiday.service");
const holiday_dto_1 = require("./dto/holiday.dto");
let HolidayController = class HolidayController {
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.create(req.user.tenantId, dto);
    }
    list(req, query) {
        return this.service.list(req.user.tenantId, query.year, query.type);
    }
    upcoming(req) {
        return this.service.upcoming(req.user.tenantId);
    }
    update(req, id, dto) {
        return this.service.update(req.user.tenantId, id, dto);
    }
    remove(req, id) {
        return this.service.remove(req.user.tenantId, id);
    }
};
exports.HolidayController = HolidayController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, holiday_dto_1.CreateHolidayDto]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, holiday_dto_1.HolidayQueryDto]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "upcoming", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, holiday_dto_1.UpdateHolidayDto]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HolidayController.prototype, "remove", null);
exports.HolidayController = HolidayController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Holidays'),
    (0, common_1.Controller)('settings/holidays'),
    __metadata("design:paramtypes", [holiday_service_1.HolidayService])
], HolidayController);
//# sourceMappingURL=holiday.controller.js.map