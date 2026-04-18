import { IQueryHandler } from '@nestjs/cqrs';
import { GetExecutiveDashboardQuery } from './get-executive-dashboard.query';
import { DashboardAggregatorService } from '../../../services/dashboard-aggregator.service';
export declare class GetExecutiveDashboardHandler implements IQueryHandler<GetExecutiveDashboardQuery> {
    private readonly dashboardService;
    private readonly logger;
    constructor(dashboardService: DashboardAggregatorService);
    execute(query: GetExecutiveDashboardQuery): Promise<{
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
}
