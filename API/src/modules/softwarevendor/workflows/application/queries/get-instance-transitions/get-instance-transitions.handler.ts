import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { GetInstanceTransitionsQuery } from './get-instance-transitions.query';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions')
@QueryHandler(GetInstanceTransitionsQuery)
export class GetInstanceTransitionsHandler implements IQueryHandler<GetInstanceTransitionsQuery> {
  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(query: GetInstanceTransitionsQuery) {
    return this.engine.getAvailableTransitions(query.instanceId, query.userId);
  }
}
