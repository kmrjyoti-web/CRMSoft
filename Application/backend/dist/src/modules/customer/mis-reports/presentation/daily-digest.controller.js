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
exports.DailyDigestController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const report_engine_service_1 = require("../infrastructure/report-engine.service");
const daily_digest_settings_dto_1 = require("./dto/daily-digest-settings.dto");
let DailyDigestController = class DailyDigestController {
    constructor(reportEngine, prisma) {
        this.reportEngine = reportEngine;
        this.prisma = prisma;
    }
    async getDigest(user) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);
        const data = await this.reportEngine.generate('MIS_DAILY_DIGEST', {
            dateFrom: todayStart,
            dateTo: todayEnd,
            userId: user.id,
            tenantId: user.tenantId,
        });
        return api_response_1.ApiResponse.success(data, "Today's daily digest");
    }
    async updateSettings(dto, user) {
        const digestDef = await this.prisma.working.reportDefinition.findFirst({
            where: { code: 'MIS_DAILY_DIGEST' },
        });
        const existing = await this.prisma.working.scheduledReport.findFirst({
            where: {
                createdById: user.id,
                reportDef: { code: 'MIS_DAILY_DIGEST' },
            },
        });
        const nextScheduledAt = this.calculateNextDigestTime(dto.timeOfDay || '08:00');
        if (existing) {
            const updated = await this.prisma.working.scheduledReport.update({
                where: { id: existing.id },
                data: {
                    recipientEmails: dto.recipientEmails,
                    recipientUserIds: dto.recipientUserIds || [],
                    timeOfDay: dto.timeOfDay || '08:00',
                    format: (dto.format || 'PDF'),
                    nextScheduledAt,
                    status: 'ACTIVE',
                },
                include: { reportDef: true },
            });
            return api_response_1.ApiResponse.success(updated, 'Daily digest settings updated');
        }
        const reportDefId = digestDef?.id || '';
        const schedule = await this.prisma.working.scheduledReport.create({
            data: {
                reportDefId,
                name: 'Daily Digest',
                frequency: 'DAILY',
                format: (dto.format || 'PDF'),
                recipientEmails: dto.recipientEmails,
                recipientUserIds: dto.recipientUserIds || [],
                timeOfDay: dto.timeOfDay || '08:00',
                nextScheduledAt,
                status: 'ACTIVE',
                createdById: user.id,
            },
            ...(digestDef ? { include: { reportDef: true } } : {}),
        });
        return api_response_1.ApiResponse.success(schedule, 'Daily digest schedule created');
    }
    calculateNextDigestTime(timeOfDay) {
        const [hours, minutes] = timeOfDay.split(':').map(Number);
        const next = new Date();
        next.setHours(hours, minutes, 0, 0);
        if (next <= new Date()) {
            next.setDate(next.getDate() + 1);
        }
        return next;
    }
};
exports.DailyDigestController = DailyDigestController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DailyDigestController.prototype, "getDigest", null);
__decorate([
    (0, common_1.Put)('settings'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [daily_digest_settings_dto_1.DailyDigestSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], DailyDigestController.prototype, "updateSettings", null);
exports.DailyDigestController = DailyDigestController = __decorate([
    (0, common_1.Controller)('mis-reports/daily-digest'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [report_engine_service_1.ReportEngineService,
        prisma_service_1.PrismaService])
], DailyDigestController);
//# sourceMappingURL=daily-digest.controller.js.map