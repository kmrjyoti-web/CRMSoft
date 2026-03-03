import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../core/workflow/workflow-engine.service';
import { GetEntityStatusQuery } from './get-entity-status.query';

@QueryHandler(GetEntityStatusQuery)
export class GetEntityStatusHandler implements IQueryHandler<GetEntityStatusQuery> {
  constructor(private readonly engine: WorkflowEngineService) {}

  async execute(query: GetEntityStatusQuery) {
    return this.engine.getEntityStatus(query.entityType, query.entityId);
  }
}
