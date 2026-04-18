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
exports.ActivityAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let ActivityAnalyticsService = class ActivityAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getActivityHeatmap(params) {
        const where = { createdAt: { gte: params.dateFrom, lte: params.dateTo } };
        if (params.userId)
            where.createdById = params.userId;
        if (params.activityType)
            where.type = params.activityType;
        const activities = await this.prisma.working.activity.findMany({
            where,
            select: { createdAt: true, type: true },
        });
        const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
        let maxValue = 0;
        const dailyCounts = {};
        const byType = {};
        const byDayOfWeek = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (const a of activities) {
            const d = new Date(a.createdAt);
            const dow = d.getDay();
            const hour = d.getHours();
            grid[dow][hour]++;
            if (grid[dow][hour] > maxValue)
                maxValue = grid[dow][hour];
            const dateKey = d.toISOString().split('T')[0];
            dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
            byType[a.type] = (byType[a.type] || 0) + 1;
            byDayOfWeek[dayNames[dow]]++;
        }
        let peakDay = 0, peakHour = 0, peakCount = 0;
        let quietDay = 0, quietHour = 0, quietCount = Infinity;
        for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
                if (grid[d][h] > peakCount) {
                    peakDay = d;
                    peakHour = h;
                    peakCount = grid[d][h];
                }
                if (grid[d][h] < quietCount) {
                    quietDay = d;
                    quietHour = h;
                    quietCount = grid[d][h];
                }
            }
        }
        const hourLabel = (h) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
        const calendarGrid = Object.entries(dailyCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({
            date, count,
            level: count === 0 ? 0 : count <= 5 ? 1 : count <= 15 ? 2 : count <= 25 ? 3 : 4,
        }));
        const sortedDates = Object.keys(dailyCounts).sort().reverse();
        let streakDays = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        let checkDate = new Date(todayStr);
        for (let i = 0; i < 365; i++) {
            const key = checkDate.toISOString().split('T')[0];
            if (dailyCounts[key] && dailyCounts[key] > 0) {
                streakDays++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
            else
                break;
        }
        const totalDays = Math.max(1, Math.ceil((params.dateTo.getTime() - params.dateFrom.getTime()) / 86400000));
        return {
            weeklyGrid: {
                data: grid, maxValue,
                labels: {
                    days: dayNames,
                    hours: Array.from({ length: 24 }, (_, i) => hourLabel(i)),
                },
                peakTime: { day: dayNames[peakDay], hour: hourLabel(peakHour), count: peakCount },
                quietTime: { day: dayNames[quietDay], hour: hourLabel(quietHour), count: quietCount === Infinity ? 0 : quietCount },
            },
            calendarGrid,
            summary: {
                totalActivities: activities.length,
                avgPerDay: Math.round((activities.length / totalDays) * 10) / 10,
                mostActiveDay: calendarGrid.length > 0
                    ? calendarGrid.reduce((max, d) => d.count > max.count ? d : max, calendarGrid[0])
                    : null,
                streakDays,
                byType,
                byDayOfWeek,
            },
        };
    }
};
exports.ActivityAnalyticsService = ActivityAnalyticsService;
exports.ActivityAnalyticsService = ActivityAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityAnalyticsService);
//# sourceMappingURL=activity-analytics.service.js.map