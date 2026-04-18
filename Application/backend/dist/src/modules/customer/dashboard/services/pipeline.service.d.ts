import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class PipelineService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSalesPipeline(params: {
        dateFrom?: Date;
        dateTo?: Date;
        userId?: string;
    }): Promise<{
        stages: {
            status: string;
            label: string;
            color: string;
            count: number;
            value: number;
            weightedValue: number;
            probability: number;
        }[];
        summary: {
            totalLeads: number;
            totalPipelineValue: number;
            weightedPipelineValue: number;
            wonValue: number;
            lostValue: number;
            avgDealSize: number;
        };
        stageTransitions: {
            from: string;
            to: string;
            count: number;
            conversionRate: number;
        }[];
    }>;
    getSalesFunnel(params: {
        dateFrom: Date;
        dateTo: Date;
        userId?: string;
        source?: string;
    }): Promise<{
        funnel: {
            percent: number;
            dropOff: number | null;
            stage: string;
            count: number;
        }[];
        overallConversion: number;
        biggestLeakPoint: {
            stage: string;
            dropOff: number;
        };
    }>;
}
