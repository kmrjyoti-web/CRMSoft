import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class TargetCalculatorService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    recalculateTargets(): Promise<void>;
    calculateMetric(metric: string, start: Date, end: Date, userId?: string | null): Promise<number>;
    getTargetTracking(params: {
        period?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<{
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
