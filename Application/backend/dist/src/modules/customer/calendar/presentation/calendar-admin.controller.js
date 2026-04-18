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
exports.CalendarAdminController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const calendar_config_service_1 = require("../services/calendar-config.service");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CalendarAdminController = class CalendarAdminController {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    async getAllConfigs(tenantId) {
        const configs = await this.configService.getAllConfigs(tenantId);
        return api_response_1.ApiResponse.success(configs);
    }
    async getConfig(tenantId, key) {
        const value = await this.configService.getConfig(tenantId, key);
        return api_response_1.ApiResponse.success(value);
    }
    async upsertConfig(tenantId, userId, key, body) {
        const result = await this.configService.upsertConfig(tenantId, key, body.value, body.description, userId);
        return api_response_1.ApiResponse.success(result, 'Config updated');
    }
    async resetToDefaults(tenantId, userId) {
        await this.configService.resetToDefaults(tenantId, userId);
        return api_response_1.ApiResponse.success(null, 'Calendar configs reset to defaults');
    }
    async getHolidays(tenantId) {
        const holidays = await this.prisma.working.holidayCalendar.findMany({
            where: { tenantId, isActive: true },
            orderBy: { date: 'asc' },
        });
        return api_response_1.ApiResponse.success(holidays);
    }
    async createHoliday(tenantId, body) {
        const holiday = await this.prisma.working.holidayCalendar.create({
            data: {
                tenantId,
                name: body.name,
                date: new Date(body.date),
                type: body.type || 'COMPANY',
                isRecurring: body.isRecurring ?? false,
                applicableStates: body.applicableStates ?? [],
                isHalfDay: body.isHalfDay ?? false,
                halfDayEnd: body.halfDayEnd,
                description: body.description,
            },
        });
        return api_response_1.ApiResponse.success(holiday, 'Holiday created');
    }
    async deleteHoliday(id) {
        await this.prisma.working.holidayCalendar.update({
            where: { id },
            data: { isActive: false },
        });
        return api_response_1.ApiResponse.success(null, 'Holiday deleted');
    }
};
exports.CalendarAdminController = CalendarAdminController;
__decorate([
    (0, common_1.Get)('config'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:admin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarAdminController.prototype, "getAllConfigs", null);
__decorate([
    (0, common_1.Get)('config/:key'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:admin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarAdminController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('config/:key'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:admin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('key')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], CalendarAdminController.prototype, "upsertConfig", null);
__decorate([
    (0, common_1.Post)('config/reset'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarAdminController.prototype, "resetToDefaults", null);
__decorate([
    (0, common_1.Get)('holidays'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:admin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarAdminController.prototype, "getHolidays", null);
__decorate([
    (0, common_1.Post)('holidays'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CalendarAdminController.prototype, "createHoliday", null);
__decorate([
    (0, common_1.Delete)('holidays/:id'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarAdminController.prototype, "deleteHoliday", null);
exports.CalendarAdminController = CalendarAdminController = __decorate([
    (0, common_1.Controller)('calendar/admin'),
    __metadata("design:paramtypes", [calendar_config_service_1.CalendarConfigService,
        prisma_service_1.PrismaService])
], CalendarAdminController);
//# sourceMappingURL=calendar-admin.controller.js.map