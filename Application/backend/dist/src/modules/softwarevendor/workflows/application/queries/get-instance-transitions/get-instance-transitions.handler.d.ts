import { IQueryHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { GetInstanceTransitionsQuery } from './get-instance-transitions.query';
export declare class GetInstanceTransitionsHandler implements IQueryHandler<GetInstanceTransitionsQuery> {
    private readonly engine;
    private readonly logger;
    constructor(engine: WorkflowEngineService);
    execute(query: GetInstanceTransitionsQuery): Promise<import("../../../../../../core/workflow/interfaces/workflow-types.interface").AvailableTransition[]>;
}
