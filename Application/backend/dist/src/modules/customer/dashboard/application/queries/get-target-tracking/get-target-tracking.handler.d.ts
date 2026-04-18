import { IQueryHandler } from '@nestjs/cqrs';
import { GetTargetTrackingQuery } from './get-target-tracking.query';
import { TargetCalculatorService } from '../../../services/target-calculator.service';
export declare class GetTargetTrackingHandler implements IQueryHandler<GetTargetTrackingQuery> {
    private readonly targetCalculator;
    private readonly logger;
    constructor(targetCalculator: TargetCalculatorService);
    execute(query: GetTargetTrackingQuery): Promise<{
        targets: {
            targetId: string;
            userId: string | null;
            metric: import("@prisma/working-client").$Enums.TargetMetric;
            name: string | null;
            targetValue: number;
            currentValue: number;
            achievedPercent: number;
            remaining: number;
            daysLeft: number;
            requiredPerDay: number;
            status: string;
            projectedValue: number;
            projectedAchievement: number;
        }[];
        summary: {
            totalTargets: number;
            achieved: number;
            onTrack: number;
            atRisk: number;
            behind: number;
            overallAchievement: number;
        };
    }>;
}
