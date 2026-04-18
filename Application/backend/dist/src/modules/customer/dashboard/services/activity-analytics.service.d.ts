import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ActivityAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getActivityHeatmap(params: {
        dateFrom: Date;
        dateTo: Date;
        userId?: string;
        activityType?: string;
    }): Promise<{
        weeklyGrid: {
            data: number[][];
            maxValue: number;
            labels: {
                days: string[];
                hours: string[];
            };
            peakTime: {
                day: string;
                hour: string;
                count: number;
            };
            quietTime: {
                day: string;
                hour: string;
                count: number;
            };
        };
        calendarGrid: {
            date: string;
            count: number;
            level: number;
        }[];
        summary: {
            totalActivities: number;
            avgPerDay: number;
            mostActiveDay: {
                date: string;
                count: number;
                level: number;
            } | null;
            streakDays: number;
            byType: Record<string, number>;
            byDayOfWeek: Record<string, number>;
        };
    }>;
}
