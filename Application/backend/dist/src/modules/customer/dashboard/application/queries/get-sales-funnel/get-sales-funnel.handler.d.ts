import { IQueryHandler } from '@nestjs/cqrs';
import { GetSalesFunnelQuery } from './get-sales-funnel.query';
import { PipelineService } from '../../../services/pipeline.service';
export declare class GetSalesFunnelHandler implements IQueryHandler<GetSalesFunnelQuery> {
    private readonly pipelineService;
    private readonly logger;
    constructor(pipelineService: PipelineService);
    execute(query: GetSalesFunnelQuery): Promise<{
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
