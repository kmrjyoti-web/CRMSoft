import { IQueryHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { GetEntityStatusQuery } from './get-entity-status.query';
export declare class GetEntityStatusHandler implements IQueryHandler<GetEntityStatusQuery> {
    private readonly engine;
    private readonly logger;
    constructor(engine: WorkflowEngineService);
    execute(query: GetEntityStatusQuery): Promise<import("../../../../../../core/workflow/interfaces/workflow-types.interface").EntityStatus | null>;
}
