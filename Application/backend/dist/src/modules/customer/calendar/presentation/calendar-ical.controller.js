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
exports.CalendarICalController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const ical_service_1 = require("../services/ical.service");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CalendarICalController = class CalendarICalController {
    constructor(icalService, prisma) {
        this.icalService = icalService;
        this.prisma = prisma;
    }
    async exportIcal(userId, tenantId, startDate, endDate, res) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 3600000);
        const end = endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 3600000);
        const icsContent = await this.icalService.exportToIcs(userId, tenantId, start, end);
        res.set({
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="calendar.ics"',
        });
        res.send(icsContent);
    }
    async importIcal(userId, tenantId, body) {
        const count = await this.icalService.importFromIcs(body.icsContent, userId, tenantId);
        return api_response_1.ApiResponse.success({ imported: count }, `Imported ${count} events`);
    }
    async publicFeed(token, res) {
        const sync = await this.prisma.working.userCalendarSync.findFirst({
            where: {
                provider: 'ICAL',
                calendarId: token,
                isActive: true,
                status: 'ACTIVE',
            },
        });
        if (!sync) {
            throw new common_1.NotFoundException('Invalid or expired feed token');
        }
        const start = new Date(Date.now() - 30 * 24 * 3600000);
        const end = new Date(Date.now() + 180 * 24 * 3600000);
        const icsContent = await this.icalService.exportToIcs(sync.userId, sync.tenantId, start, end);
        await this.prisma.working.userCalendarSync.update({
            where: { id: sync.id },
            data: { lastSyncAt: new Date() },
        });
        res.set({
            'Content-Type': 'text/calendar; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        res.send(icsContent);
    }
    async generateFeedToken(userId, tenantId) {
        const token = this.icalService.generateFeedToken(userId, tenantId);
        await this.prisma.working.userCalendarSync.upsert({
            where: {
                tenantId_userId_provider: { tenantId, userId, provider: 'ICAL' },
            },
            update: { calendarId: token, status: 'ACTIVE', isActive: true },
            create: {
                tenantId,
                userId,
                provider: 'ICAL',
                direction: 'ONE_WAY_FROM_CRM',
                calendarId: token,
                status: 'ACTIVE',
            },
        });
        return api_response_1.ApiResponse.success({ token, feedUrl: `/api/v1/calendar/ical/feed/${token}` }, 'Feed token generated');
    }
};
exports.CalendarICalController = CalendarICalController;
__decorate([
    (0, common_1.Get)('export'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], CalendarICalController.prototype, "exportIcal", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CalendarICalController.prototype, "importIcal", null);
__decorate([
    (0, common_1.Get)('feed/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CalendarICalController.prototype, "publicFeed", null);
__decorate([
    (0, common_1.Post)('feed/generate'),
    (0, require_permissions_decorator_1.RequirePermissions)('calendar:sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalendarICalController.prototype, "generateFeedToken", null);
exports.CalendarICalController = CalendarICalController = __decorate([
    (0, common_1.Controller)('calendar/ical'),
    __metadata("design:paramtypes", [ical_service_1.ICalService,
        prisma_service_1.PrismaService])
], CalendarICalController);
//# sourceMappingURL=calendar-ical.controller.js.map