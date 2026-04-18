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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let CronAnalyticsService = class CronAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const allJobs = await this.prisma.working.cronJobConfig.findMany();
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentRuns = await this.prisma.working.cronJobRunLog.findMany({
            where: { createdAt: { gte: twentyFourHoursAgo } },
            orderBy: { createdAt: 'desc' },
        });
        const activeJobs = allJobs.filter((j) => j.status === 'ACTIVE').length;
        const pausedJobs = allJobs.filter((j) => j.status === 'PAUSED').length;
        const running = allJobs.filter((j) => j.isRunning);
        const failedRuns = recentRuns.filter((r) => r.status === 'FAILED' || r.status === 'TIMEOUT');
        const successRuns = recentRuns.filter((r) => r.status === 'SUCCESS');
        return {
            overview: {
                totalJobs: allJobs.length,
                activeJobs,
                pausedJobs,
                currentlyRunning: running.length,
                failedLast24h: failedRuns.length,
                successRate24h: recentRuns.length
                    ? Math.round((successRuns.length / recentRuns.length) * 10000) / 100
                    : 100,
            },
            currentlyRunning: running.map((j) => ({
                jobCode: j.jobCode,
                startedAt: j.lastRunAt,
                runningForMs: j.lastRunAt ? now.getTime() - j.lastRunAt.getTime() : 0,
            })),
            recentFailures: allJobs
                .filter((j) => j.consecutiveFailures > 0)
                .map((j) => ({
                jobCode: j.jobCode,
                lastRunAt: j.lastRunAt,
                error: j.lastRunError,
                consecutiveFailures: j.consecutiveFailures,
            })),
            nextUp: allJobs
                .filter((j) => j.status === 'ACTIVE' && j.nextRunAt)
                .sort((a, b) => (a.nextRunAt.getTime() - b.nextRunAt.getTime()))
                .slice(0, 10)
                .map((j) => ({
                jobCode: j.jobCode,
                nextRunAt: j.nextRunAt,
                inMs: j.nextRunAt.getTime() - now.getTime(),
            })),
        };
    }
    async getTimeline() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return this.prisma.working.cronJobRunLog.findMany({
            where: { createdAt: { gte: startOfDay } },
            select: {
                jobCode: true,
                startedAt: true,
                finishedAt: true,
                durationMs: true,
                status: true,
                triggeredBy: true,
            },
            orderBy: { startedAt: 'asc' },
        });
    }
    async getHealth() {
        return this.prisma.working.cronJobConfig.findMany({
            where: { status: 'ACTIVE' },
            select: {
                jobCode: true,
                jobName: true,
                successRate: true,
                avgDurationMs: true,
                lastRunStatus: true,
                lastRunAt: true,
                consecutiveFailures: true,
                totalRunCount: true,
                totalFailCount: true,
            },
            orderBy: { jobCode: 'asc' },
        });
    }
};
exports.CronAnalyticsService = CronAnalyticsService;
exports.CronAnalyticsService = CronAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CronAnalyticsService);
//# sourceMappingURL=cron-analytics.service.js.map