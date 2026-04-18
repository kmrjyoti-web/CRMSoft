import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class DashboardAggregatorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getExecutiveDashboard(params: {
        dateFrom: Date;
        dateTo: Date;
        userId?: string;
        compareWithPrevious?: boolean;
    }): Promise<{
        period: {
            from: string;
            to: string;
        };
        previousPeriod: {
            from: string;
            to: string;
        };
        kpiCards: ({
            color: string;
            changePercent: number;
            changeDirection: string;
            key: string;
            label: string;
            value: number;
            previousValue: number;
        } | {
            suffix: string;
            color: string;
            changePercent: number;
            changeDirection: string;
            key: string;
            label: string;
            value: number;
            previousValue: number;
        } | {
            prefix: string;
            format: string;
            color: string;
            changePercent: number;
            changeDirection: string;
            key: string;
            label: string;
            value: number;
            previousValue: number;
        } | {
            suffix: string;
            color: string;
            lowerIsBetter: boolean;
            changePercent: number;
            changeDirection: string;
            key: string;
            label: string;
            value: number;
            previousValue: number;
        })[];
        quickStats: {
            overdueFollowUps: number;
            upcomingDemos: number;
            expiringQuotations: number;
            unassignedLeads: number;
        };
    }>;
    getMyDashboard(userId: string): Promise<{
        today: {
            date: string;
            activitiesPlanned: number;
            activitiesCompleted: number;
            upcomingDemos: number;
            overdueFollowUps: number;
        };
        myLeads: Record<string, number>;
        myQuotations: {
            draft: number;
            sent: number;
        };
        myTargets: {
            metric: import("@prisma/working-client").$Enums.TargetMetric;
            target: number;
            current: number;
            percent: number;
            status: string;
        }[];
        recentActivity: {
            createdAt: Date;
            type: import("@prisma/working-client").$Enums.ActivityType;
            subject: string;
            completedAt: Date | null;
        }[];
    }>;
}
