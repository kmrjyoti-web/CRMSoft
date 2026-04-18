import { IQueryHandler } from '@nestjs/cqrs';
import { GetMyDashboardQuery } from './get-my-dashboard.query';
import { DashboardAggregatorService } from '../../../services/dashboard-aggregator.service';
export declare class GetMyDashboardHandler implements IQueryHandler<GetMyDashboardQuery> {
    private readonly dashboardService;
    private readonly logger;
    constructor(dashboardService: DashboardAggregatorService);
    execute(query: GetMyDashboardQuery): Promise<{
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
