import { IQueryHandler } from '@nestjs/cqrs';
import { GetSalesPipelineQuery } from './get-sales-pipeline.query';
import { PipelineService } from '../../../services/pipeline.service';
export declare class GetSalesPipelineHandler implements IQueryHandler<GetSalesPipelineQuery> {
    private readonly pipelineService;
    private readonly logger;
    constructor(pipelineService: PipelineService);
    execute(query: GetSalesPipelineQuery): Promise<{
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
}
