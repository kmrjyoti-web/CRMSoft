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
var ErrorCaptureCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCaptureCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const escalation_service_1 = require("./escalation.service");
let ErrorCaptureCron = ErrorCaptureCron_1 = class ErrorCaptureCron {
    constructor(db, escalationService) {
        this.db = db;
        this.escalationService = escalationService;
        this.logger = new common_1.Logger(ErrorCaptureCron_1.name);
    }
    async checkThresholds() {
        try {
            await this.escalationService.checkThresholdRules();
        }
        catch (error) {
            this.logger.error(`ErrorCaptureCron.checkThresholds failed: ${error.message}`, error.stack);
        }
    }
    async dailyTrend() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().slice(0, 10);
            const bySeverity = await this.db.globalErrorLog.groupBy({
                by: ['severity', 'brandId', 'verticalType'],
                _count: { id: true },
                where: {
                    createdAt: {
                        gte: new Date(dateStr + 'T00:00:00Z'),
                        lt: new Date(new Date(dateStr + 'T00:00:00Z').getTime() + 86400000),
                    },
                },
            });
            const totalErrors = bySeverity.reduce((sum, r) => sum + r._count.id, 0);
            const criticalCount = bySeverity
                .filter((r) => r.severity === 'CRITICAL')
                .reduce((sum, r) => sum + r._count.id, 0);
            const highCount = bySeverity
                .filter((r) => r.severity === 'HIGH')
                .reduce((sum, r) => sum + r._count.id, 0);
            const resolvedCount = await this.db.globalErrorLog.count({
                where: {
                    resolvedAt: {
                        gte: new Date(dateStr + 'T00:00:00Z'),
                        lt: new Date(new Date(dateStr + 'T00:00:00Z').getTime() + 86400000),
                    },
                },
            });
            await this.db.errorTrend.upsert({
                where: {
                    period_periodDate_brandId: {
                        period: 'DAILY',
                        periodDate: dateStr,
                        brandId: null,
                    },
                },
                create: {
                    period: 'DAILY',
                    periodDate: dateStr,
                    totalErrors,
                    criticalCount,
                    highCount,
                    resolvedCount,
                },
                update: { totalErrors, criticalCount, highCount, resolvedCount },
            });
            this.logger.log(`Daily trend aggregated for ${dateStr}: ${totalErrors} total, ${criticalCount} critical`);
        }
        catch (error) {
            this.logger.error(`ErrorCaptureCron.dailyTrend failed: ${error.message}`, error.stack);
        }
    }
    async weeklyTrend() {
        try {
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            const weekStr = `${now.getFullYear()}-W${String(Math.ceil(now.getDate() / 7)).padStart(2, '0')}`;
            const [totalErrors, criticalCount, highCount, resolvedCount] = await Promise.all([
                this.db.globalErrorLog.count({
                    where: { createdAt: { gte: weekStart } },
                }),
                this.db.globalErrorLog.count({
                    where: { createdAt: { gte: weekStart }, severity: 'CRITICAL' },
                }),
                this.db.globalErrorLog.count({
                    where: { createdAt: { gte: weekStart }, severity: 'HIGH' },
                }),
                this.db.globalErrorLog.count({
                    where: {
                        resolvedAt: { gte: weekStart },
                    },
                }),
            ]);
            await this.db.errorTrend.upsert({
                where: {
                    period_periodDate_brandId: {
                        period: 'WEEKLY',
                        periodDate: weekStr,
                        brandId: null,
                    },
                },
                create: {
                    period: 'WEEKLY',
                    periodDate: weekStr,
                    totalErrors,
                    criticalCount,
                    highCount,
                    resolvedCount,
                },
                update: { totalErrors, criticalCount, highCount, resolvedCount },
            });
            this.logger.log(`Weekly trend aggregated for ${weekStr}: ${totalErrors} total`);
        }
        catch (error) {
            this.logger.error(`ErrorCaptureCron.weeklyTrend failed: ${error.message}`, error.stack);
        }
    }
};
exports.ErrorCaptureCron = ErrorCaptureCron;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *', {
        name: 'error-threshold-check',
        timeZone: 'Asia/Kolkata',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ErrorCaptureCron.prototype, "checkThresholds", null);
__decorate([
    (0, schedule_1.Cron)('30 2 * * *', {
        name: 'daily-error-trend',
        timeZone: 'Asia/Kolkata',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ErrorCaptureCron.prototype, "dailyTrend", null);
__decorate([
    (0, schedule_1.Cron)('30 0 * * 0', {
        name: 'weekly-error-trend',
        timeZone: 'Asia/Kolkata',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ErrorCaptureCron.prototype, "weeklyTrend", null);
exports.ErrorCaptureCron = ErrorCaptureCron = ErrorCaptureCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService,
        escalation_service_1.EscalationService])
], ErrorCaptureCron);
//# sourceMappingURL=error-capture.cron.js.map