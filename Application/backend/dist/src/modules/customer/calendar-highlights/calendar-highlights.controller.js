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
exports.CalendarHighlightsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const calendar_highlights_service_1 = require("./calendar-highlights.service");
let CalendarHighlightsController = class CalendarHighlightsController {
    constructor(svc) {
        this.svc = svc;
    }
    async list(req, from, to, types) {
        const tenantId = req.user?.tenantId ?? '';
        const typeArr = types ? types.split(',') : undefined;
        const data = await this.svc.getHighlights(tenantId, from, to, typeArr);
        return { success: true, data };
    }
    async holidays(req, year) {
        const tenantId = req.user?.tenantId ?? '';
        const data = await this.svc.getHolidays(tenantId, parseInt(year) || new Date().getFullYear());
        return { success: true, data };
    }
    async create(req, body) {
        const tenantId = req.user?.tenantId ?? '';
        const data = await this.svc.create(tenantId, body);
        return { success: true, data };
    }
};
exports.CalendarHighlightsController = CalendarHighlightsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('types')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarHighlightsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('holidays'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarHighlightsController.prototype, "holidays", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalendarHighlightsController.prototype, "create", null);
exports.CalendarHighlightsController = CalendarHighlightsController = __decorate([
    (0, common_1.Controller)('api/v1/calendar/highlights'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [calendar_highlights_service_1.CalendarHighlightsService])
], CalendarHighlightsController);
//# sourceMappingURL=calendar-highlights.controller.js.map