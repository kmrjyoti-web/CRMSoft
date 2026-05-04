import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { GetInstanceTransitionsQuery } from './get-instance-transitions.query';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions')
@QueryHandler(GetInstanceTransitionsQuery)
export class GetInstanceTransitionsHandler implements IQueryHandler<GetInstanceTransitionsQuery> {
    private readonly logger = new Logger(GetInstanceTransitionsHandler.name);

  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(query: GetInstanceTransitionsQuery) {
    try {
      return this.engine.getAvailableTransitions(query.instanceId, query.userId);
    } catch (error) {
      this.logger.error(`GetInstanceTransitionsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
