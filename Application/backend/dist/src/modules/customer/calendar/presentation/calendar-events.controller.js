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
exports.CalendarEventsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const scheduling_service_1 = require("../services/scheduling.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const rsvp_dto_1 = require("./dto/rsvp.dto");
const event_query_dto_1 = require("./dto/event-query.dto");
let CalendarEventsController = class CalendarEventsController {
    constructor(scheduling) {
        this.scheduling = scheduling;
    }
    async create(dto, userId, tenantId, roleLevel) {
        const result = await this.scheduling.createEvent(dto, userId, tenantId, roleLevel);
        return api_response_1.ApiResponse.success(result, 'Event created successfully');
    }
    async list(query, userId, tenantId, roleLevel) {
        const page = parseInt(query.page ?? '1', 10);
        const limit = parseInt(query.limit ?? '20', 10);
        const { data, total } = await this.scheduling.listEvents(userId, tenantId, roleLevel, page, limit, query);
        return api_response_1.ApiResponse.paginated(data, total, page, limit);
    }
    async getById(id, userId, tenantId, roleLevel) {
        const result = await this.scheduling.getEventById(id, userId, tenantId, roleLevel);
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, userId, tenantId) {
        const result = await this.scheduling.updateEvent(id, dto, userId, tenantId);
        return api_response_1.ApiResponse.success(result, 'Event updated successfully');
    }
    async cancel(id, reason, userId, tenantId) {
        const result = await this.scheduling.cancelEvent(id, reason, userId, tenantId);
        return api_response_1.ApiResponse.success(result, 'Event cancelled successfully');
    }
    async reschedule(id, startTime, endTime, userId, tenantId) {
        const result = await this.scheduling.rescheduleEvent(id, startTime, endTime, userId, tenantId);
        return api_response_1.ApiResponse.success(result, 'Event rescheduled successfully');
    }
    async addParticipant(eventId, participantDto, userId, tenantId) {
        const result = await this.scheduling.addParticipant(eventId, participantDto, userId, tenantId);
        return api_response_1.ApiResponse.success(result, 'Participant added successfully');
    }
    async removeParticipant(eventId, participantUserId, userId, tenantId) {
        await this.scheduling.removeParticipant(eventId, participantUserId, userId, tenantId);
        return api_response_1.ApiResponse.success(null, 'Participant removed successfully');
    }
    async updateRsvp(eventId, dto, userId, tenantId) {
        const result = await this.scheduling.updateRSVP(eventId, userId, dto.rsvpStatus, tenantId);
        return api_response_1.ApiResponse.success(result, 'RSVP updated successfully');
    }
    async getHistory(eventId, tenantId) {
        const result = await this.scheduling.getEventHistory(eventId, tenantId);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.CalendarEventsController = CalendarEventsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('roleLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateScheduledEventDto, String, String, Number]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('roleLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_query_dto_1.EventQueryDto, String, String, Number]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('roleLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateScheduledEventDto, String, String]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/reschedule'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('startTime')),
    __param(2, (0, common_1.Body)('endTime')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(4, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Post)(':id/participants'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_event_dto_1.EventParticipantDto, String, String]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "addParticipant", null);
__decorate([
    (0, common_1.Delete)(':id/participants/:uid'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('uid')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "removeParticipant", null);
__decorate([
    (0, common_1.Post)(':id/rsvp'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rsvp_dto_1.RsvpDto, String, String]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "updateRsvp", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarEventsController.prototype, "getHistory", null);
exports.CalendarEventsController = CalendarEventsController = __decorate([
    (0, common_1.Controller)('calendar/events'),
    __metadata("design:paramtypes", [scheduling_service_1.SchedulingService])
], CalendarEventsController);
//# sourceMappingURL=calendar-events.controller.js.map