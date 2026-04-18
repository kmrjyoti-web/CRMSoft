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
exports.ReportSchedulesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const update_schedule_dto_1 = require("./dto/update-schedule.dto");
let ReportSchedulesController = class ReportSchedulesController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const reportDef = await this.prisma.working.reportDefinition.findFirst({
            where: { code: dto.reportCode },
        });
        if (!reportDef) {
            throw new common_1.NotFoundException(`Report definition not found: ${dto.reportCode}`);
        }
        const nextScheduledAt = this.calculateNextScheduledAt(dto.frequency, dto.dayOfWeek, dto.dayOfMonth, dto.timeOfDay || '08:00');
        const schedule = await this.prisma.working.scheduledReport.create({
            data: {
                reportDefId: reportDef.id,
                name: dto.name,
                frequency: dto.frequency,
                format: dto.format,
                filters: dto.filters ?? undefined,
                recipientEmails: dto.recipientEmails,
                dayOfWeek: dto.dayOfWeek,
                dayOfMonth: dto.dayOfMonth,
                timeOfDay: dto.timeOfDay || '08:00',
                nextScheduledAt,
                status: 'ACTIVE',
                createdById: userId,
            },
            include: { reportDef: true },
        });
        return api_response_1.ApiResponse.success(schedule, 'Scheduled report created');
    }
    async list(userId) {
        const schedules = await this.prisma.working.scheduledReport.findMany({
            where: { createdById: userId },
            include: { reportDef: true },
            orderBy: { createdAt: 'desc' },
        });
        return api_response_1.ApiResponse.success(schedules, 'Scheduled reports retrieved');
    }
    async getById(id) {
        const schedule = await this.prisma.working.scheduledReport.findFirst({
            where: { id }, include: { reportDef: true },
        });
        if (!schedule)
            throw new common_1.NotFoundException('Scheduled report not found');
        return api_response_1.ApiResponse.success(schedule, 'Scheduled report retrieved');
    }
    async update(id, dto) {
        const existing = await this.prisma.working.scheduledReport.findFirst({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Scheduled report not found');
        const data = { ...dto };
        delete data.reportCode;
        const frequencyChanged = dto.frequency !== undefined
            || dto.dayOfWeek !== undefined || dto.dayOfMonth !== undefined
            || dto.timeOfDay !== undefined;
        if (frequencyChanged) {
            data.nextScheduledAt = this.calculateNextScheduledAt(dto.frequency || existing.frequency, dto.dayOfWeek ?? existing.dayOfWeek ?? undefined, dto.dayOfMonth ?? existing.dayOfMonth ?? undefined, dto.timeOfDay || existing.timeOfDay || '08:00');
        }
        const updated = await this.prisma.working.scheduledReport.update({
            where: { id }, data, include: { reportDef: true },
        });
        return api_response_1.ApiResponse.success(updated, 'Scheduled report updated');
    }
    async remove(id) {
        const existing = await this.prisma.working.scheduledReport.findFirst({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Scheduled report not found');
        const cancelled = await this.prisma.working.scheduledReport.update({
            where: { id }, data: { status: 'CANCELLED' },
        });
        return api_response_1.ApiResponse.success(cancelled, 'Scheduled report cancelled');
    }
    calculateNextScheduledAt(frequency, dayOfWeek, dayOfMonth, timeOfDay = '08:00') {
        const now = new Date();
        const [hours, minutes] = timeOfDay.split(':').map(Number);
        const next = new Date(now);
        next.setHours(hours, minutes, 0, 0);
        if (next <= now)
            next.setDate(next.getDate() + 1);
        switch (frequency) {
            case 'DAILY': break;
            case 'WEEKLY':
                if (dayOfWeek !== undefined) {
                    const daysUntil = (dayOfWeek - next.getDay() + 7) % 7 || 7;
                    next.setDate(next.getDate() + daysUntil);
                }
                break;
            case 'MONTHLY':
                next.setMonth(next.getMonth() + 1);
                next.setDate(Math.min(dayOfMonth || 1, 28));
                break;
            case 'QUARTERLY':
                next.setMonth(next.getMonth() + 3);
                next.setDate(Math.min(dayOfMonth || 1, 28));
                break;
            case 'YEARLY':
                next.setFullYear(next.getFullYear() + 1);
                next.setDate(Math.min(dayOfMonth || 1, 28));
                break;
        }
        return next;
    }
};
exports.ReportSchedulesController = ReportSchedulesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_schedule_dto_1.CreateScheduleDto, String]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_schedule_dto_1.UpdateScheduleDto]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportSchedulesController.prototype, "remove", null);
exports.ReportSchedulesController = ReportSchedulesController = __decorate([
    (0, common_1.Controller)('mis-reports/schedules'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportSchedulesController);
//# sourceMappingURL=report-schedules.controller.js.map