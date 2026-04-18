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
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const calendar_service_1 = require("../calendar.service");
const unified_calendar_service_1 = require("../services/unified-calendar.service");
const calendar_query_dto_1 = require("./dto/calendar-query.dto");
let CalendarController = class CalendarController {
    constructor(calendarService, unifiedCalendar) {
        this.calendarService = calendarService;
        this.unifiedCalendar = unifiedCalendar;
    }
    async getEvents(query, userId, tenantId) {
        const result = await this.calendarService.getCalendarEvents(tenantId, userId, new Date(query.startDate), new Date(query.endDate), query.eventTypes);
        return api_response_1.ApiResponse.success(result);
    }
    async unifiedView(query, userId, tenantId, roleLevel) {
        const targetUserId = query.userId ?? userId;
        const result = await this.unifiedCalendar.getUnifiedView(targetUserId, tenantId, roleLevel, new Date(query.startDate), new Date(query.endDate), query.sources, query.search);
        return api_response_1.ApiResponse.success(result);
    }
    async agendaView(query, userId, tenantId, roleLevel) {
        const targetUserId = query.userId ?? userId;
        const events = await this.unifiedCalendar.getUnifiedView(targetUserId, tenantId, roleLevel, new Date(query.startDate), new Date(query.endDate), query.sources, query.search);
        const grouped = {};
        for (const event of events) {
            const dayKey = event.startTime.toISOString().slice(0, 10);
            if (!grouped[dayKey])
                grouped[dayKey] = [];
            grouped[dayKey].push(event);
        }
        const agenda = Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, items]) => ({ date, events: items }));
        return api_response_1.ApiResponse.success(agenda);
    }
    async stats(userId, tenantId, roleLevel) {
        const result = await this.unifiedCalendar.getStats(userId, tenantId, roleLevel);
        return api_response_1.ApiResponse.success(result);
    }
    async dayView(date, userId, tenantId) {
        const result = await this.calendarService.getDayView(tenantId, userId, new Date(date));
        return api_response_1.ApiResponse.success(result);
    }
    async weekView(date, userId, tenantId) {
        const result = await this.calendarService.getWeekView(tenantId, userId, new Date(date));
        return api_response_1.ApiResponse.success(result);
    }
    async monthView(year, month, userId, tenantId) {
        const result = await this.calendarService.getMonthView(tenantId, userId, +year, +month);
        return api_response_1.ApiResponse.success(result);
    }
    async availability(targetUserId, date, tenantId) {
        const result = await this.calendarService.getAvailability(tenantId, targetUserId, new Date(date));
        return api_response_1.ApiResponse.success(result);
    }
    async teamCalendar(query, tenantId) {
        const result = await this.calendarService.getTeamCalendar(tenantId, query.userIds, new Date(query.startDate), new Date(query.endDate));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendar_query_dto_1.CalendarQueryDto, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('unified'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('roleLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendar_query_dto_1.UnifiedCalendarQueryDto, String, String, Number]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "unifiedView", null);
__decorate([
    (0, common_1.Get)('agenda'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('roleLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendar_query_dto_1.UnifiedCalendarQueryDto, String, String, Number]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "agendaView", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('roleLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('day/:date'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "dayView", null);
__decorate([
    (0, common_1.Get)('week/:date'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "weekView", null);
__decorate([
    (0, common_1.Get)('month/:year/:month'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Param)('month')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "monthView", null);
__decorate([
    (0, common_1.Get)('availability/:userId/:date'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('date')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "availability", null);
__decorate([
    (0, common_1.Get)('team'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendar_query_dto_1.TeamCalendarQueryDto, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "teamCalendar", null);
exports.CalendarController = CalendarController = __decorate([
    (0, common_1.Controller)('calendar'),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService,
        unified_calendar_service_1.UnifiedCalendarService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map