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
exports.CalendarAvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const availability_service_1 = require("../services/availability.service");
const working_hours_dto_1 = require("./dto/working-hours.dto");
const blocked_slot_dto_1 = require("./dto/blocked-slot.dto");
const free_slots_query_dto_1 = require("./dto/free-slots-query.dto");
let CalendarAvailabilityController = class CalendarAvailabilityController {
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    async setWorkingHours(dto, userId, tenantId) {
        const result = await this.availabilityService.setWorkingHours(userId, tenantId, dto.hours, dto.timezone);
        return api_response_1.ApiResponse.success(result, 'Working hours updated');
    }
    async getOwnWorkingHours(userId, tenantId) {
        const result = await this.availabilityService.getWorkingHours(userId, tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async getUserWorkingHours(userId, tenantId) {
        const result = await this.availabilityService.getWorkingHours(userId, tenantId);
        return api_response_1.ApiResponse.success(result);
    }
    async createBlockedSlot(dto, userId, tenantId) {
        const result = await this.availabilityService.createBlockedSlot(userId, tenantId, dto);
        return api_response_1.ApiResponse.success(result, 'Blocked slot created');
    }
    async listBlockedSlots(query, userId, tenantId) {
        const result = await this.availabilityService.listBlockedSlots(userId, tenantId, new Date(query.startDate), new Date(query.endDate));
        return api_response_1.ApiResponse.success(result);
    }
    async deleteBlockedSlot(id, userId, tenantId) {
        await this.availabilityService.deleteBlockedSlot(id, userId, tenantId);
        return api_response_1.ApiResponse.success(null, 'Blocked slot deleted');
    }
    async checkConflicts(dto, userId, tenantId) {
        const result = await this.availabilityService.checkConflicts(userId, tenantId, new Date(dto.startTime), new Date(dto.endTime), dto.excludeEventId);
        return api_response_1.ApiResponse.success(result);
    }
    async findFreeSlots(dto, tenantId) {
        const result = await this.availabilityService.findFreeSlots(dto.userIds, tenantId, new Date(dto.date), dto.durationMinutes, dto.timezone);
        return api_response_1.ApiResponse.success(result);
    }
};
exports.CalendarAvailabilityController = CalendarAvailabilityController;
__decorate([
    (0, common_1.Put)('working-hours'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [working_hours_dto_1.SetWorkingHoursDto, String, String]),
    __metadata("design:returntype", Promise)
], CalendarAvailabilityController.prototype, "setWorkingHours", null);
__decorate([
    (0, common_1.Get)('working-hours'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarAvailabilityController.prototype, "getOwnWorkingHours", null);
__decorate([
    (0, common_1.Get)('working-hours/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarAvailabilityController.prototype, "getUserWorkingHours", null);
__decorate([
    (0, common_1.Post)('blocked-slots'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blocked_slot_dto_1.CreateBlockedSlotDto, String, String]),
    __metadata("design:returntype", Promise)
], CalendarAvailabilityController.prototype, "createBlockedSlot", null);
__decorate([
    (0, common_1.Get)('blocked-slots'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blocked_slot_dto_1.ListBlockedSlotsQueryDto, String, String]),
    __metadata("design:returntype", Promise)
], CalendarAvailabilityController.prototype, "listBlockedSlots", null);
__decorate([
    (0, common_1.Delete)('blocked-slots/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalendarAvailabilityController.prototype, "deleteBlockedSlot", null);
__decorate([
    (0, common_1.Post)('check-conflicts'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [free_slots_query_dto_1.ConflictCheckDto, String, String]),
    __metadata("design:returntype", Promise)
], CalendarAvailabilityController.prototype, "checkConflicts", null);
__decorate([
    (0, common_1.Post)('free-slots'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [free_slots_query_dto_1.FreeSlotsQueryDto, String]),
    __metadata("design:returntype", Promise)
], CalendarAvailabilityController.prototype, "findFreeSlots", null);
exports.CalendarAvailabilityController = CalendarAvailabilityController = __decorate([
    (0, common_1.Controller)('calendar/availability'),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], CalendarAvailabilityController);
//# sourceMappingURL=calendar-availability.controller.js.map