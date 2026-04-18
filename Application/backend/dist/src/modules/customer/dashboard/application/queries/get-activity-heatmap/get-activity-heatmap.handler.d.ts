import { IQueryHandler } from '@nestjs/cqrs';
import { GetActivityHeatmapQuery } from './get-activity-heatmap.query';
import { ActivityAnalyticsService } from '../../../services/activity-analytics.service';
export declare class GetActivityHeatmapHandler implements IQueryHandler<GetActivityHeatmapQuery> {
    private readonly activityAnalytics;
    private readonly logger;
    constructor(activityAnalytics: ActivityAnalyticsService);
    execute(query: GetActivityHeatmapQuery): Promise<{
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
