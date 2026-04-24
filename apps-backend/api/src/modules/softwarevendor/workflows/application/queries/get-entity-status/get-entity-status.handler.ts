import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { GetEntityStatusQuery } from './get-entity-status.query';
import { CrossService } from '../../../../../../common/decorators/cross-service.decorator';

@CrossService('work', 'Uses WorkflowEngineService from core/workflow (Work service) to execute tenant workflow state transitions')
@QueryHandler(GetEntityStatusQuery)
export class GetEntityStatusHandler implements IQueryHandler<GetEntityStatusQuery> {
    private readonly logger = new Logger(GetEntityStatusHandler.name);

  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(query: GetEntityStatusQuery) {
    try {
      return this.engine.getEntityStatus(query.entityType, query.entityId);
    } catch (error) {
      this.logger.error(`GetEntityStatusHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
