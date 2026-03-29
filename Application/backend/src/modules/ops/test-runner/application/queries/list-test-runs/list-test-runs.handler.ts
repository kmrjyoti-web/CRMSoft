import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListTestRunsQuery } from './list-test-runs.query';
import { TEST_RUN_REPOSITORY, ITestRunRepository } from '../../../infrastructure/repositories/test-run.repository';

@QueryHandler(ListTestRunsQuery)
export class ListTestRunsHandler implements IQueryHandler<ListTestRunsQuery> {
  constructor(
    @Inject(TEST_RUN_REPOSITORY)
    private readonly repo: ITestRunRepository,
  ) {}

  async execute(query: ListTestRunsQuery): Promise<any[]> {
    return this.repo.findByTenantId(query.tenantId, query.filters);
  }
}
